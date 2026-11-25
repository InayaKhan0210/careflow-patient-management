import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from config import Config
from models import db, Patient
from validation import validate_patient_data, GENDERS, WARDS, DEPARTMENTS, DOCTORS

app = Flask(__name__)
app.config.from_object(Config)

CORS(
    app,
    resources={
        r"/api/*": {"origins": os.getenv("FRONTEND_URL", "http://localhost:5173")}
    },
)
db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Patient Admission Management API is running"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


# Dropdown options for frontend
@app.route("/api/options", methods=["GET"])
def get_options():
    return jsonify(
        {
            "genders": GENDERS,
            "wards": WARDS,
            "departments": DEPARTMENTS,
            "doctors": DOCTORS,
        }
    )


# Add a patient
@app.route("/api/patients", methods=["POST"])
def add_patient():
    data = request.get_json(silent=True)

    cleaned, errors = validate_patient_data(data)

    if errors:
        return jsonify({"message": "Validation failed", "errors": errors}), 400

    patient = Patient(**cleaned)

    try:
        db.session.add(patient)
        db.session.commit()

        return (
            jsonify(
                {"message": "Patient added successfully", "patient": patient.to_dict()}
            ),
            201,
        )

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Unable to save patient"}), 500


# View patients with search and filters
@app.route("/api/patients", methods=["GET"])
def get_patients():
    query = Patient.query

    search = request.args.get("search", "").strip()
    ward = request.args.get("ward", "").strip()
    department = request.args.get("department", "").strip()
    doctor = request.args.get("doctor", "").strip()
    status = request.args.get("status", "").strip()

    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))

    if ward:
        query = query.filter_by(ward=ward)

    if department:
        query = query.filter_by(department=department)

    if doctor:
        query = query.filter_by(doctor=doctor)

    if status:
        query = query.filter_by(status=status)

    patients = query.order_by(Patient.id.desc()).all()

    return jsonify(
        {
            "count": len(patients),
            "patients": [patient.to_dict() for patient in patients],
        }
    )


# Edit a patient
@app.route("/api/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    patient = db.session.get(Patient, patient_id)

    if not patient:
        return jsonify({"message": "Patient not found"}), 404

    data = request.get_json(silent=True)
    cleaned, errors = validate_patient_data(data)

    if errors:
        return jsonify({"message": "Validation failed", "errors": errors}), 400

    for field, value in cleaned.items():
        setattr(patient, field, value)

    try:
        db.session.commit()

        return jsonify(
            {"message": "Patient updated successfully", "patient": patient.to_dict()}
        )

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Unable to update patient"}), 500


# Delete a patient
@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    patient = db.session.get(Patient, patient_id)

    if not patient:
        return jsonify({"message": "Patient not found"}), 404

    try:
        db.session.delete(patient)
        db.session.commit()

        return jsonify({"message": "Patient deleted successfully"})

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Unable to delete patient"}), 500


# Discharge a patient
@app.route("/api/patients/<int:patient_id>/discharge", methods=["PATCH"])
def discharge_patient(patient_id):
    patient = db.session.get(Patient, patient_id)

    if not patient:
        return jsonify({"message": "Patient not found"}), 404

    if patient.status == "Discharged":
        return jsonify({"message": "Patient is already discharged"}), 400

    patient.status = "Discharged"

    try:
        db.session.commit()

        return jsonify(
            {"message": "Patient discharged successfully", "patient": patient.to_dict()}
        )

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Unable to discharge patient"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
