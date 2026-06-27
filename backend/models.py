from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # Admin, Clinician, Reception
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String, unique=True, index=True)
    child_name = Column(String)
    age_months = Column(Integer)
    gender = Column(String)
    guardian_name = Column(String)
    contact_number = Column(String)
    address = Column(Text)
    referral_source = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    screenings = relationship("Screening", back_populates="patient")

class Screening(Base):
    __tablename__ = "screenings"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    clinician_id = Column(Integer, ForeignKey("users.id"))
    screening_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    total_score = Column(Integer)
    risk_level = Column(String) # Low, Moderate, High
    confidence_score = Column(Float)
    summary = Column(Text)
    recommendation = Column(Text)
    status = Column(String) # Draft, Completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="screenings")
    answers = relationship("ScreeningAnswer", back_populates="screening", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="screening", cascade="all, delete-orphan")
    notes = relationship("ClinicianNote", back_populates="screening", cascade="all, delete-orphan")

class ScreeningAnswer(Base):
    __tablename__ = "screening_answers"

    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id"))
    question_code = Column(String)
    section = Column(String)
    answer_value = Column(Integer)
    weighted_score = Column(Integer)
    note = Column(Text, nullable=True)

    screening = relationship("Screening", back_populates="answers")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id"))
    pdf_path = Column(String)
    generated_by = Column(Integer, ForeignKey("users.id"))
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    screening = relationship("Screening", back_populates="reports")

class ClinicianNote(Base):
    __tablename__ = "clinician_notes"

    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id"))
    clinician_id = Column(Integer, ForeignKey("users.id"))
    note = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    screening = relationship("Screening", back_populates="notes")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(Integer)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    metadata_json = Column(JSON, nullable=True)

class AIModel(Base):
    __tablename__ = "ai_models"

    model_id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    date_trained = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Prediction(Base):
    __tablename__ = "predictions"

    prediction_id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("patients.id"))
    model_id = Column(Integer, ForeignKey("ai_models.model_id"))
    prediction_result = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value_json = Column(JSON)
