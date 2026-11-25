
from datetime import date

GENDERS = ["Male", "Female", "Other"]

WARDS = [
    "General Ward",
    "ICU",
    "Private Ward",
    "Emergency Ward",
    "Pediatric Ward"
]

DEPARTMENTS = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
    "Surgery"
]

DOCTORS = [
    "Dr. Amit Sharma",
    "Dr. Priya Patel",
    "Dr. Rahul Verma",
    "Dr. Neha Singh",
    "Dr. Arjun Mehta",
    "Dr. Sneha Joshi"
]

STATUSES = ["Admitted", "Discharged"]


def validate_patient_data(data):
    errors = {}
    cleaned = {}

    if not isinstance(data, dict):
        return {}, {"general": "Request body must be a JSON object."}

    # Validate patient name
    name = data.get("name")

    if not isinstance(name, str) or not name.strip():
        errors["name"] = "Patient name is required."
    else:
        name = " ".join(name.split())

        if not all(part.isalpha() for part in name.split()):
            errors["name"] = "Name must contain letters only."
        elif len(name) > 100:
            errors["name"] = "Name cannot exceed 100 characters."
        else:
            cleaned["name"] = name

    # Validate age
    age = data.get("age")

    if age is None or isinstance(age, bool):
        errors["age"] = "Age is required."
    elif not isinstance(age, int):
        errors["age"] = "Age must be a whole number."
    elif not 0 <= age <= 120:
        errors["age"] = "Age must be between 0 and 120."
    else:
        cleaned["age"] = age

    # Validate dropdown fields
    dropdown_fields = {
        "gender": GENDERS,
        "ward": WARDS,
        "department": DEPARTMENTS,
        "doctor": DOCTORS
    }

    for field, allowed_values in dropdown_fields.items():
        value = data.get(field)

        if not isinstance(value, str) or not value.strip():
            errors[field] = f"{field.capitalize()} is required."
        elif value not in allowed_values:
            errors[field] = f"Invalid {field} selection."
        else:
            cleaned[field] = value

    # Validate admission date
    admission_date = data.get("admission_date")

    if not isinstance(admission_date, str) or not admission_date.strip():
        errors["admission_date"] = "Admission date is required."
    else:
        try:
            parsed_date = date.fromisoformat(admission_date)

            if parsed_date.isoformat() != admission_date:
                raise ValueError

            if parsed_date > date.today():
                errors["admission_date"] = (
                    "Admission date cannot be in the future."
                )
            else:
                cleaned["admission_date"] = parsed_date

        except ValueError:
            errors["admission_date"] = (
                "Enter a valid date in YYYY-MM-DD format."
            )

    # Validate status
    status = data.get("status", "Admitted")

    if not isinstance(status, str) or status not in STATUSES:
        errors["status"] = "Status must be Admitted or Discharged."
    else:
        cleaned["status"] = status

    return cleaned, errors
