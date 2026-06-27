import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from fastapi.responses import FileResponse
import models

def generate_pdf_report(screening: models.Screening, patient: models.Patient, file_path: str):
    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "AURA Clinical Assessment Report")
    
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 70, f"Report generated on: {screening.created_at.strftime('%Y-%m-%d %H:%M')}")
    
    # Patient Demographics
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 100, "Patient Information")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 120, f"Child Name: {patient.child_name}")
    c.drawString(50, height - 135, f"Age (Months): {patient.age_months}")
    c.drawString(50, height - 150, f"Patient ID: {patient.patient_code}")
    c.drawString(300, height - 120, f"Guardian: {patient.guardian_name}")
    c.drawString(300, height - 135, f"Contact: {patient.contact_number}")
    
    # Divider
    c.setStrokeColor(colors.lightgrey)
    c.line(50, height - 165, width - 50, height - 165)
    
    # Results
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 190, "Screening Summary")
    
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 210, f"Risk Level: {screening.risk_level} Risk")
    c.drawString(50, height - 225, f"Total Score: {screening.total_score}")
    c.drawString(50, height - 240, f"Confidence Estimate: {screening.confidence_score}%")
    
    # Wrap text for recommendation
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, height - 265, "Clinical Interpretation & Recommendation:")
    c.setFont("Helvetica", 10)
    
    # Simple word wrap equivalent
    from textwrap import wrap
    y_pos = height - 280
    for line in wrap(screening.summary, 90):
        c.drawString(50, y_pos, line)
        y_pos -= 15
        
    y_pos -= 10
    for line in wrap(screening.recommendation, 90):
        c.drawString(50, y_pos, line)
        y_pos -= 15
    
    y_pos -= 30
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(50, y_pos, "DISCLAIMER: This system provides clinical decision support and screening.")
    c.drawString(50, y_pos - 12, "It does not replace formal medical diagnosis by a qualified clinical professional.")
    
    c.save()
    return file_path
