# CareFlow – Patient Admission Management System

A full-stack Patient Admission Management System designed to help hospital staff manage patient admissions, maintain patient records, and track discharge status through a simple, responsive dashboard.

**Live Application:** https://careflow-patient-management.vercel.app/

**Backend API:** https://careflow-patient-management.onrender.com

**GitHub Repository:** https://github.com/InayaKhan0210/careflow-patient-management

---

## Features

### Patient Management
- Register new patients with admission details.
- View and manage patient records.
- Edit existing patient information.
- Delete patient records with confirmation.
- Discharge admitted patients.

### Search and Filtering
- Search patients by name.
- Filter records by ward, department, and doctor.
- View admitted patients separately from complete patient records.

### Dashboard
- Overview of patient admission statistics.
- Recent patient records.
- Separate workspaces for Overview, Patients, Admissions, and Records.

### Validation
- Patient name is required and accepts letters only.
- Age must be between 0 and 120.
- Gender, ward, department, and doctor must be selected from valid options.
- Admission date is required and cannot be in the future.
- Backend validation rejects invalid data and returns meaningful error messages.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Python, Flask |
| ORM | Flask-SQLAlchemy |
| Database | PostgreSQL (Neon) |
| Local Database | SQLite |
| API | REST API |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

---

## Project Structure

```text
careflow-patient-management/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── validation.py
│   ├── requirements.txt
│   └── patients.db
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

---

## Local Setup and Installation

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/InayaKhan0210/careflow-patient-management.git

cd careflow-patient-management
```

### 2. Set up the backend

Open a terminal in the project root:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask server:

```bash
python app.py
```

The backend will run at:

`http://127.0.0.1:5000`

By default, the local setup uses SQLite. For PostgreSQL, configure the `DATABASE_URL` environment variable with your database connection string.

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will run at:

`http://localhost:5173`

---

## API Endpoints

Base URL: `https://careflow-patient-management.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/options` | Retrieve dropdown options |
| GET | `/api/patients` | Retrieve patient records |
| POST | `/api/patients` | Register a new patient |
| PUT | `/api/patients/<id>` | Update patient details |
| DELETE | `/api/patients/<id>` | Delete a patient |
| PATCH | `/api/patients/<id>/discharge` | Discharge a patient |

The patient listing endpoint also supports search and filtering parameters.

---

## Database

The application uses SQLAlchemy for database operations.

- SQLite is used for local development by default.
- PostgreSQL is used for the deployed application through Neon.
- Patient records are stored persistently in the database.
- Database tables are initialized automatically when the backend starts.

---

## Deployment

| Component | Platform |
|---|---|
| React Frontend | Vercel |
| Flask Backend | Render |
| PostgreSQL Database | Neon |

**Live Frontend:** https://careflow-patient-management.vercel.app/

**Backend Health Check:** https://careflow-patient-management.onrender.com/api/health

---

## Author

**Inaya Khan**

B.Tech – Electronics and Computer Engineering

GitHub: https://github.com/InayaKhan0210

---

## Assignment

Developed as part of the Software Engineer Intern – Round 1 assignment for DScribe.