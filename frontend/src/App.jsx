
import { useCallback, useEffect, useState } from "react";
import {
  Activity, BedDouble, CalendarDays, Check, CheckCircle2,
  ClipboardList, Clock3, Filter, HeartPulse, LayoutDashboard,
  LogOut, MoreHorizontal, Pencil, Plus, Search, Stethoscope,
  Trash2, Users, X, AlertCircle, FileText
} from "lucide-react";
import "./App.css";

const API = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api"}`;

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  ward: "",
  department: "",
  doctor: "",
  admission_date: new Date().toISOString().slice(0, 10),
  status: "Admitted"
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.details = data.errors || {};
    throw error;
  }

  return data;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2)
    .map(part => part[0].toUpperCase()).join("");
}

function PatientForm({ patient, options, onClose, onSaved }) {
  const [form, setForm] = useState(
    patient ? { ...patient, age: String(patient.age) } : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = Boolean(patient);

  function change(event) {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "", general: "" }));
  }

  function validate() {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Patient name is required.";
    } else if (!/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/.test(form.name.trim())) {
      next.name = "Use letters and spaces only.";
    }

    if (form.age === "") {
      next.age = "Age is required.";
    } else if (
      !Number.isInteger(Number(form.age)) ||
      Number(form.age) < 0 ||
      Number(form.age) > 120
    ) {
      next.age = "Enter an age between 0 and 120.";
    }

    ["gender", "ward", "department", "doctor"].forEach(field => {
      if (!form[field]) next[field] = "Please select an option.";
    });

    if (!form.admission_date) {
      next.admission_date = "Admission date is required.";
    } else if (form.admission_date > new Date().toISOString().slice(0, 10)) {
      next.admission_date = "Admission date cannot be in the future.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const payload = {
      ...form,
      name: form.name.trim().replace(/\s+/g, " "),
      age: Number(form.age)
    };

    try {
      await apiRequest(
        editing ? `/patients/${patient.id}` : "/patients",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );

      onSaved(editing ? "Patient updated successfully." : "Patient added successfully.");
    } catch (error) {
      setErrors({
        ...error.details,
        general: error.details?.general || error.message
      });
    } finally {
      setSaving(false);
    }
  }

  const dropdowns = [
    { name: "gender", label: "Gender", values: options.genders },
    { name: "ward", label: "Ward", values: options.wards },
    { name: "department", label: "Department", values: options.departments },
    { name: "doctor", label: "Assigned doctor", values: options.doctors }
  ];

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="patient-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{editing ? "PATIENT RECORD" : "NEW REGISTRATION"}</span>
            <h2>{editing ? "Edit patient" : "Add new patient"}</h2>
            <p>Enter the patient's admission information.</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="patient-form" onSubmit={submit}>
          {errors.general && <div className="form-error"><AlertCircle size={16} />{errors.general}</div>}

          <div className="form-section-title">Personal information</div>
          <div className="form-grid">
            <div className="field full-width">
              <label>Patient full name *</label>
              <input name="name" value={form.name} onChange={change} placeholder="Enter full name" />
              {errors.name && <small>{errors.name}</small>}
            </div>

            <div className="field">
              <label>Age *</label>
              <input name="age" type="number" min="0" max="120" value={form.age} onChange={change} placeholder="Age in years" />
              {errors.age && <small>{errors.age}</small>}
            </div>

            <div className="field">
              <label>Gender *</label>
              <select name="gender" value={form.gender} onChange={change}>
                <option value="">Select gender</option>
                {options.genders.map(v => <option key={v}>{v}</option>)}
              </select>
              {errors.gender && <small>{errors.gender}</small>}
            </div>
          </div>

          <div className="form-section-title">Admission details</div>
          <div className="form-grid">
            {dropdowns.slice(1).map(item => (
              <div className="field" key={item.name}>
                <label>{item.label} *</label>
                <select name={item.name} value={form[item.name]} onChange={change}>
                  <option value="">Select {item.label.toLowerCase()}</option>
                  {item.values.map(v => <option key={v}>{v}</option>)}
                </select>
                {errors[item.name] && <small>{errors[item.name]}</small>}
              </div>
            ))}

            <div className="field">
              <label>Admission date *</label>
              <input type="date" name="admission_date" max={new Date().toISOString().slice(0, 10)} value={form.admission_date} onChange={change} />
              {errors.admission_date && <small>{errors.admission_date}</small>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Add patient"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState({
    genders: [], wards: [], departments: [], doctors: []
  });
  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    ward: "", department: "", doctor: "", status: ""
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuId, setMenuId] = useState(null);

  const notify = useCallback((message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const loadOptions = useCallback(async () => {
    try {
      setOptions(await apiRequest("/options"));
    } catch {
      notify("Unable to load dropdown options.", "error");
    }
  }, [notify]);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    try {
      const data = await apiRequest(`/patients?${params.toString()}`);
      setPatients(data.patients || []);
    } catch {
      notify("Unable to load patient records.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, filters, notify]);

  useEffect(() => { loadOptions(); }, [loadOptions]);
  useEffect(() => { loadPatients(); }, [loadPatients]);

  function navigate(page) {
    setActivePage(page);
    setSearch("");
    setFilters({ ward: "", department: "", doctor: "", status: "" });
    setMenuId(null);
  }

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setSearch("");
    setFilters({ ward: "", department: "", doctor: "", status: "" });
  }

  async function discharge(patient) {
    if (patient.status === "Discharged") return;
    if (!window.confirm(`Discharge ${patient.name}?`)) return;

    try {
      await apiRequest(`/patients/${patient.id}/discharge`, { method: "PATCH" });
      notify(`${patient.name} has been discharged.`);
      loadPatients();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function removePatient(patient) {
    if (!window.confirm(`Delete the record for ${patient.name}? This cannot be undone.`)) return;

    try {
      await apiRequest(`/patients/${patient.id}`, { method: "DELETE" });
      notify("Patient record deleted.");
      loadPatients();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  function saved(message) {
    setModal(null);
    notify(message);
    loadPatients();
  }

  const admitted = patients.filter(p => p.status === "Admitted");
  const discharged = patients.filter(p => p.status === "Discharged");
  const hasFilters = Boolean(search || Object.values(filters).some(Boolean));

  const pageInfo = {
    Overview: {
      description: "Here is an overview of your patient admissions.",
      icon: LayoutDashboard
    },
    Patients: {
      description: "View and manage all registered patients.",
      icon: Users
    },
    Admissions: {
      description: "Monitor patients currently admitted to the hospital.",
      icon: BedDouble
    },
    Records: {
      description: "View complete patient admission and discharge history.",
      icon: FileText
    }
  };

  const visiblePatients = activePage === "Admissions"
    ? patients.filter(p => p.status === "Admitted")
    : activePage === "Overview"
      ? patients.slice(0, 5)
      : patients;

  const showFilters = activePage === "Patients" || activePage === "Records";

  function PatientTable({ rows }) {
    return (
      <div className="table-wrapper">
        <table className="patient-table">
          <thead>
            <tr>
              <th>PATIENT</th>
              <th>AGE / GENDER</th>
              <th>WARD</th>
              <th>DEPARTMENT</th>
              <th>DOCTOR</th>
              <th>ADMISSION DATE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="empty-state"><div className="loading-spinner" />Loading records...</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  <div className="empty-icon"><Users size={24} /></div>
                  <strong>No patient records found</strong>
                  <span>{hasFilters ? "Try changing your search or filters." : "There are no records to display."}</span>
                  {hasFilters && <button className="text-button" onClick={clearFilters}>Clear filters</button>}
                </td>
              </tr>
            ) : rows.map(patient => (
              <tr key={patient.id}>
                <td>
                  <div className="patient-name-cell">
                    <div className="patient-avatar">{getInitials(patient.name)}</div>
                    <div><strong>{patient.name}</strong><span>Patient #{patient.id}</span></div>
                  </div>
                </td>
                <td><div className="cell-main">{patient.age} years</div><div className="cell-sub">{patient.gender}</div></td>
                <td><div className="cell-main">{patient.ward}</div></td>
                <td><div className="cell-main">{patient.department}</div></td>
                <td><div className="cell-main">{patient.doctor}</div></td>
                <td><div className="date-cell"><Clock3 size={14} />{formatDate(patient.admission_date)}</div></td>
                <td>
                  <span className={`status-badge ${patient.status === "Admitted" ? "admitted" : "discharged"}`}>
                    <span className="status-dot" />{patient.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-menu-wrap">
                    <button className="icon-button" onClick={() => setMenuId(menuId === patient.id ? null : patient.id)} aria-label="Patient actions">
                      <MoreHorizontal size={19} />
                    </button>
                    {menuId === patient.id && (
                      <div className="action-menu">
                        <button onClick={() => { setModal(patient); setMenuId(null); }}><Pencil size={15} />Edit details</button>
                        {patient.status === "Admitted" && (
                          <button onClick={() => { setMenuId(null); discharge(patient); }}><CheckCircle2 size={15} />Discharge</button>
                        )}
                        <button className="danger-action" onClick={() => { setMenuId(null); removePatient(patient); }}><Trash2 size={15} />Delete record</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-symbol"><HeartPulse size={23} /></div>
          <div><div className="brand-name">CareFlow</div><div className="brand-caption">PATIENT MANAGEMENT</div></div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {[
            { name: "Overview", icon: LayoutDashboard },
            { name: "Patients", icon: Users },
            { name: "Admissions", icon: BedDouble },
            { name: "Records", icon: ClipboardList }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${activePage === item.name ? "active" : ""}`}
                onClick={() => navigate(item.name)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="facility-card">
            <div className="facility-icon"><Stethoscope size={19} /></div>
            <div><strong>CareFlow Medical</strong><span>Hospital workspace</span></div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / {activePage}</div>
            <h1>{activePage}</h1>
          </div>
          <div className="topbar-right">
            <div className="today-label"><CalendarDays size={16} />{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
            <div className="admin-avatar">A</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <span className="eyebrow">HOSPITAL OPERATIONS</span>
              <h2>{activePage === "Overview" ? "Good day, Administrator" : activePage}</h2>
              <p>{pageInfo[activePage].description}</p>
            </div>
            <button className="button button-primary add-button" onClick={() => setModal("new")}>
              <Plus size={18} />Add new patient
            </button>
          </section>

          {activePage === "Overview" && (
            <>
              <section className="stats-grid">
                <StatCard title="Total patients" number={patients.length} detail="Registered patients" icon={<Users size={19} />} />
                <StatCard title="Currently admitted" number={admitted.length} detail="Active admissions" icon={<Activity size={19} />} />
                <StatCard title="Discharged" number={discharged.length} detail="Completed admissions" icon={<Check size={19} />} />
                <StatCard title="Departments" number={options.departments.length} detail="Available departments" icon={<Stethoscope size={19} />} />
              </section>
            </>
          )}

          {activePage === "Admissions" && (
            <section className="stats-grid two-stats">
              <StatCard title="Active admissions" number={admitted.length} detail="Patients currently admitted" icon={<BedDouble size={19} />} />
              <StatCard title="Available departments" number={options.departments.length} detail="Departments in the hospital" icon={<Stethoscope size={19} />} />
            </section>
          )}

          {activePage === "Records" && (
            <section className="stats-grid two-stats">
              <StatCard title="Total records" number={patients.length} detail="All patient records" icon={<FileText size={19} />} />
              <StatCard title="Discharged records" number={discharged.length} detail="Completed admissions" icon={<Check size={19} />} />
            </section>
          )}

          <section className="records-panel">
            <div className="records-heading">
              <div>
                <div className="heading-with-icon">
                  <div className="heading-icon"><ClipboardList size={19} /></div>
                  <h2>{activePage === "Overview" ? "Recent patients" : activePage === "Admissions" ? "Current admissions" : activePage === "Records" ? "Patient history" : "All patients"}</h2>
                </div>
                <p>{activePage === "Admissions" ? "Only patients with active admission status." : "Manage patient information and admission details."}</p>
              </div>
              <div className="record-count">{visiblePatients.length} records</div>
            </div>

            {showFilters && (
              <div className="toolbar">
                <div className="search-box">
                  <Search size={18} />
                  <input placeholder="Search by patient name..." value={search} onChange={e => setSearch(e.target.value)} />
                  {search && <button className="search-clear" onClick={() => setSearch("")}><X size={15} /></button>}
                </div>
                <div className="filter-label"><Filter size={16} />Filters</div>
                <select value={filters.ward} onChange={e => updateFilter("ward", e.target.value)}>
                  <option value="">All wards</option>{options.wards.map(v => <option key={v}>{v}</option>)}
                </select>
                <select value={filters.department} onChange={e => updateFilter("department", e.target.value)}>
                  <option value="">All departments</option>{options.departments.map(v => <option key={v}>{v}</option>)}
                </select>
                <select value={filters.doctor} onChange={e => updateFilter("doctor", e.target.value)}>
                  <option value="">All doctors</option>{options.doctors.map(v => <option key={v}>{v}</option>)}
                </select>
                <select value={filters.status} onChange={e => updateFilter("status", e.target.value)}>
                  <option value="">All statuses</option><option value="Admitted">Admitted</option><option value="Discharged">Discharged</option>
                </select>
                {hasFilters && <button className="clear-filters" onClick={clearFilters}>Clear</button>}
              </div>
            )}

            {activePage === "Overview" && (
              <div className="overview-summary">
                <span><span className="summary-dot green-dot" />{admitted.length} admitted</span>
                <span><span className="summary-dot grey-dot" />{discharged.length} discharged</span>
                <button className="text-button" onClick={() => navigate("Patients")}>View all patients →</button>
              </div>
            )}

            <PatientTable rows={visiblePatients} />

            <div className="table-footer">
              <span>Showing {visiblePatients.length} patients</span>
              <span className="footer-note"><span className="footer-dot" />Data saved automatically</span>
            </div>
          </section>

          <footer className="page-footer">
            <span>CareFlow Patient Management</span>
            <span>Designed for better patient care.</span>
          </footer>
        </div>
      </main>

      {modal && (
        <PatientForm
          patient={modal === "new" ? null : modal}
          options={options}
          onClose={() => setModal(null)}
          onSaved={saved}
        />
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, number, detail, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon green">{icon}</div>
      </div>
      <div className="stat-number">{number}</div>
      <div className="stat-foot">{detail}</div>
    </div>
  );
}

export default App;
