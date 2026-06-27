import database
import models
import auth
from datetime import datetime

def seed():
    db = database.SessionLocal()
    
    models.Base.metadata.create_all(bind=database.engine)
    
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.email == "admin@clinic.com").first()
    if not admin:
        admin = models.User(
            name="System Admin",
            email="admin@clinic.com",
            password_hash=auth.get_password_hash("admin123"),
            role="Admin"
        )
        db.add(admin)
        
    clinician = db.query(models.User).filter(models.User.email == "dr.smith@clinic.com").first()
    if not clinician:
        clinician = models.User(
            name="Dr. Smith",
            email="dr.smith@clinic.com",
            password_hash=auth.get_password_hash("doctor123"),
            role="Clinician"
        )
        db.add(clinician)
        
    reception = db.query(models.User).filter(models.User.email == "frontdesk@clinic.com").first()
    if not reception:
        reception = models.User(
            name="Front Desk",
            email="frontdesk@clinic.com",
            password_hash=auth.get_password_hash("desk123"),
            role="Reception"
        )
        db.add(reception)
        
    db.commit()
    
    # Check if patient exists
    p = db.query(models.Patient).first()
    if not p:
        p1 = models.Patient(
            patient_code="PT-20260411001",
            child_name="Liam Johnson",
            age_months=36,
            gender="Male",
            guardian_name="Sarah Johnson",
            contact_number="555-0102",
            address="123 Main St",
            referral_source="Pediatrician",
            created_by=clinician.id if clinician else 1
        )
        db.add(p1)
        db.commit()

    print("Database seeded successfully.")
    db.close()

if __name__ == "__main__":
    seed()
