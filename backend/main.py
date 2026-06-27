from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import database
import models
import schemas
import auth
import ml_engine
from datetime import datetime

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Autism Screening Intelligence System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "AURA Clinical Intelligence API is running", "version": "1.0.0"}

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Simple login, since OAuth2PasswordRequestForm usually takes username/password 
    # we're taking a custom UserCreate with email/password here.
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    total_active_cases = db.query(models.Patient).count()
    new_screenings_this_week = db.query(models.Screening).filter(models.Screening.status == "Completed").count() # Mock logic
    high_risk_cases = db.query(models.Screening).filter(models.Screening.risk_level == "High").count()
    pending_reviews = db.query(models.Screening).filter(models.Screening.status == "Draft").count()
    
    # recent activity (screenings)
    recent = db.query(models.Screening).order_by(models.Screening.created_at.desc()).limit(5).all()
    recent_activity = []
    for s in recent:
        p = db.query(models.Patient).filter(models.Patient.id == s.patient_id).first()
        recent_activity.append({
            "id": s.id,
            "patient_name": p.child_name if p else "Unknown",
            "date": s.created_at,
            "risk_level": s.risk_level,
            "status": s.status
        })

    return {
        "total_active_cases": total_active_cases,
        "new_screenings_this_week": new_screenings_this_week,
        "high_risk_cases": high_risk_cases,
        "pending_reviews": pending_reviews,
        "recent_activity": recent_activity
    }

@app.post("/patients", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Generate simple patient code
    code = f"PT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    new_patient = models.Patient(
        patient_code=code,
        child_name=patient.child_name,
        age_months=patient.age_months,
        gender=patient.gender,
        guardian_name=patient.guardian_name,
        contact_number=patient.contact_number,
        address=patient.address,
        referral_source=patient.referral_source,
        created_by=current_user.id
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@app.get("/patients", response_model=List[schemas.PatientResponse])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Patient).offset(skip).limit(limit).all()

@app.get("/patients/{patient_id}", response_model=schemas.PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.post("/patients/{patient_id}/facial-image")
async def upload_facial_image(patient_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    contents = await file.read()
    
    # Import locally to avoid massive tensorflow startup overhead if endpoint not used initially
    import image_engine
    
    # Run genuine Keras Convolutional Neural Network forward pass
    cnn_results = image_engine.evaluate_facial_image(contents)
    
    # Identify or create an AI_Model record for reference
    ai_model = db.query(models.AIModel).filter(models.AIModel.model_name == "MobileNetV2_Vision").first()
    if not ai_model:
        ai_model = models.AIModel(model_name="MobileNetV2_Vision", version="1.0", accuracy=87.5)
        db.add(ai_model)
        db.commit()
        db.refresh(ai_model)
        
    # Save physical Prediction in DB
    prediction = models.Prediction(
        child_id=patient.id,
        model_id=ai_model.model_id,
        prediction_result=cnn_results["predicted_class"],
        confidence_score=cnn_results["confidence"]
    )
    db.add(prediction)
    db.commit()
    
    return {
        "detail": "Facial image successfully evaluated via MobileNetV2 CNN architecture.",
        "filename": file.filename,
        "results": cnn_results
    }

@app.post("/screenings", response_model=schemas.ScreeningResponse)
def create_screening(screening: schemas.ScreeningCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == screening.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    answers_dict = [{"question_code": a.question_code, "answer_value": a.answer_value, "note": a.note} for a in screening.answers]
    
    # Extract structural CNN Prediction if it exists for this child
    latest_prediction = db.query(models.Prediction).filter(models.Prediction.child_id == patient.id).order_by(models.Prediction.date.desc()).first()
    
    cnn_dict = None
    if latest_prediction:
        cnn_dict = {
            "predicted_class": latest_prediction.prediction_result,
            "confidence_score": latest_prediction.confidence_score
        }
    
    evaluation = ml_engine.evaluate_screening(patient.age_months, answers_dict, cnn_prediction=cnn_dict)
    
    new_screening = models.Screening(
        patient_id=patient.id,
        clinician_id=current_user.id,
        total_score=evaluation["total_score"],
        risk_level=evaluation["risk_level"],
        confidence_score=evaluation["confidence_score"],
        summary=evaluation["summary"],
        recommendation=evaluation["recommendation"],
        status=screening.status
    )
    db.add(new_screening)
    db.commit()
    db.refresh(new_screening)
    
    for scored_ans in evaluation["scored_answers"]:
        db_ans = models.ScreeningAnswer(
            screening_id=new_screening.id,
            question_code=scored_ans["question_code"],
            section=scored_ans["section"],
            answer_value=scored_ans["answer_value"],
            weighted_score=scored_ans["weighted_score"],
            note=scored_ans["note"]
        )
        db.add(db_ans)
    
    db.commit()
    db.refresh(new_screening)
    return new_screening

@app.get("/screenings", response_model=List[schemas.ScreeningResponse])
def get_screenings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Screening).offset(skip).limit(limit).all()

@app.get("/screenings/{screening_id}", response_model=schemas.ScreeningResponse)
def get_screening(screening_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    screening = db.query(models.Screening).filter(models.Screening.id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    return screening

@app.get("/reports/{screening_id}/pdf")
def get_report_pdf(screening_id: int, db: Session = Depends(get_db)):
    import pdf_generator
    import os
    screening = db.query(models.Screening).filter(models.Screening.id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
        
    patient = db.query(models.Patient).filter(models.Patient.id == screening.patient_id).first()
    
    os.makedirs("./reports_output", exist_ok=True)
    pdf_path = f"./reports_output/Screening_Report_{screening.id}_{patient.patient_code}.pdf"
    
    pdf_generator.generate_pdf_report(screening, patient, pdf_path)
    
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"clinical_report_{screening_id}.pdf")

@app.get("/admin/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_role(["Admin"]))):
    # Dummy analytics for POC
    return {
        "screenings_by_month": {"Jan": 12, "Feb": 19, "Mar": 30, "Apr": 14},
        "risk_distribution": {"Low": 45, "Moderate": 35, "High": 20},
        "age_group_distribution": {"18-24": 10, "25-36": 25, "37-48": 30, "49+": 35}
    }
