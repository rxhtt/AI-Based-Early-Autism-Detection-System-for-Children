from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    child_name: str
    age_months: int
    gender: str
    guardian_name: str
    contact_number: str
    address: Optional[str] = None
    referral_source: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    patient_code: str
    created_by: int
    created_at: datetime
    class Config:
        from_attributes = True

class ScreeningAnswerBase(BaseModel):
    question_code: str
    section: str
    answer_value: int
    note: Optional[str] = None

class ScreeningCreate(BaseModel):
    patient_id: int
    answers: List[ScreeningAnswerBase]
    status: str = "Completed" # Draft or Completed

class ScreeningAnswerResponse(ScreeningAnswerBase):
    id: int
    weighted_score: int
    class Config:
        from_attributes = True

class ScreeningResponse(BaseModel):
    id: int
    patient_id: int
    clinician_id: int
    screening_date: datetime
    total_score: int
    risk_level: str
    confidence_score: float
    summary: str
    recommendation: str
    status: str
    answers: List[ScreeningAnswerResponse] = []
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None
