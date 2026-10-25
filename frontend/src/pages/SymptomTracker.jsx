
import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  Smile,
  Zap,
  Moon,
  Heart,
  Droplets,
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./SymptomTracker.css";

const SYMPTOM_OPTIONS = [
  "Headache",
  "Cramps",
  "Fatigue",
  "Mood Swings",
  "Bloating",
  "Back Pain",
  "Nausea",
  "Dizziness",
  "Acne",
  "Breast Tenderness",
  "Other",
];

function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getSeverityLabel(value) {
  const number = Number(value);

  if (number <= 3) return "Mild";
  if (number <= 6) return "Moderate";
  return "Severe";
}

function getSymptomIcon(name) {
  const symptomName = String(name).toLowerCase();

  if (symptomName.includes("head")) return Zap;
  if (symptomName.includes("cramp")) return Activity;
  if (symptomName.includes("fatigue")) return Moon;
  if (symptomName.includes("mood")) return Smile;
  if (symptomName.includes("bloat")) return Droplets;
  if (symptomName.includes("pain")) return HeartPulse;

  return Heart;
}

function getSymptomColor(name) {
  const symptomName = String(name).toLowerCase();

  if (symptomName.includes("head")) return "pink";
  if (symptomName.includes("cramp")) return "lavender";
  if (symptomName.includes("fatigue")) return "mint";
  if (symptomName.includes("mood")) return "blue";

  return "peach";
}

export default function SymptomTracker() {
  const [symptoms, setSymptoms] = useState([]);

  const [symptom, setSymptom] = useState("");
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState(5);
  const [date, setDate] = useState(localToday);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSymptoms = async () => {
    try {
      setError("");

      const data = await apiRequest("/symptoms");

      setSymptoms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load symptoms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const selectedSymptom =
      symptom === "Other"
        ? customSymptom.trim()
        : symptom.trim();

    if (!selectedSymptom || !date) {
      setError("Please select a symptom and date.");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await apiRequest("/symptoms", {
        method: "POST",
        body: JSON.stringify({
          symptom: selectedSymptom,
          severity: Number(severity),
          date,
          notes: notes.trim(),
        }),
      });

      setSymptom("");
      setCustomSymptom("");
      setSeverity(5);
      setNotes("");

      await fetchSymptoms();

      setSuccess("Symptom saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save symptom.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this symptom?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await apiRequest(`/symptoms/${id}`, {
        method: "DELETE",
      });

      setSymptoms((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setSuccess("Symptom deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete symptom.");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedSymptoms = [...symptoms].sort((a, b) =>
    String(b.date || "").localeCompare(
      String(a.date || "")
    )
  );

  return (
    <div className="sakhi-symptom-page">
      <div className="sakhi-symptom-header">
        <h1>Symptom Tracker</h1>
        <p>
          Track your symptoms and understand your health
          patterns.
        </p>
      </div>

      {error && (
        <div className="sakhi-symptom-alert error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="sakhi-symptom-alert success" role="status">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="sakhi-symptom-grid">
        {/* LEFT: ADD SYMPTOM */}
        <section className="sakhi-symptom-panel">
          <div className="sakhi-symptom-panel-title">
            <span className="sakhi-symptom-title-icon purple">
              <Plus size={18} />
            </span>

            <div>
              <h2>Add New Symptom</h2>
              <p>Record how you're feeling today</p>
            </div>
          </div>

          <form
            className="sakhi-symptom-form"
            onSubmit={handleSubmit}
          >
            <div className="sakhi-symptom-field">
              <label htmlFor="sakhi-symptom-name">
                Select Symptom
              </label>

              <select
                id="sakhi-symptom-name"
                value={symptom}
                onChange={(event) =>
                  setSymptom(event.target.value)
                }
                required
              >
                <option value="">
                  Choose a symptom
                </option>

                {SYMPTOM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {symptom === "Other" && (
              <div className="sakhi-symptom-field">
                <label htmlFor="sakhi-custom-symptom">
                  Symptom Name
                </label>

                <input
                  id="sakhi-custom-symptom"
                  type="text"
                  value={customSymptom}
                  onChange={(event) =>
                    setCustomSymptom(event.target.value)
                  }
                  placeholder="Enter your symptom"
                  maxLength={100}
                  required
                />
              </div>
            )}

            <div className="sakhi-symptom-field">
              <label htmlFor="sakhi-symptom-date">
                Date
              </label>

              <div className="sakhi-date-input-wrap">
                <CalendarDays size={17} />

                <input
                  id="sakhi-symptom-date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="sakhi-symptom-field">
              <div className="sakhi-severity-heading">
                <label htmlFor="sakhi-severity">
                  Severity Level
                </label>

                <span className="sakhi-severity-value">
                  {severity}/10
                </span>
              </div>

              <input
                id="sakhi-severity"
                className="sakhi-severity-slider"
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(event) =>
                  setSeverity(Number(event.target.value))
                }
              />

              <div className="sakhi-severity-scale">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>

              <p className="sakhi-current-severity">
                Selected: {getSeverityLabel(severity)}
              </p>
            </div>

            <div className="sakhi-symptom-field">
              <label htmlFor="sakhi-symptom-notes">
                Additional Notes
                <span className="sakhi-optional">
                  {" "}(Optional)
                </span>
              </label>

              <textarea
                id="sakhi-symptom-notes"
                rows={5}
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Add any details about how you're feeling..."
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              className="sakhi-save-symptom"
              disabled={saving}
            >
              <Plus size={18} />
              {saving ? "Saving..." : "Save Symptom"}
            </button>
          </form>
        </section>

        {/* RIGHT: PREVIOUS SYMPTOMS */}
        <section className="sakhi-symptom-panel">
          <div className="sakhi-symptom-panel-title">
            <span className="sakhi-symptom-title-icon pink">
              <ClipboardList size={18} />
            </span>

            <div>
              <h2>Previous Symptoms</h2>
              <p>
                Your recorded symptoms ({symptoms.length})
              </p>
            </div>
          </div>

          {loading ? (
            <div className="sakhi-symptom-empty">
              Loading symptoms...
            </div>
          ) : sortedSymptoms.length === 0 ? (
            <div className="sakhi-symptom-empty">
              <ClipboardList size={34} />
              <p>No symptoms recorded yet.</p>
              <span>
                Add your first symptom using the form.
              </span>
            </div>
          ) : (
            <div className="sakhi-symptom-history">
              {sortedSymptoms.map((item) => {
                const SymptomIcon = getSymptomIcon(
                  item.symptom
                );

                const color = getSymptomColor(
                  item.symptom
                );

                const severityLabel = getSeverityLabel(
                  item.severity
                );

                return (
                  <article
                    className="sakhi-symptom-history-item"
                    key={item._id}
                  >
                    <div
                      className={`sakhi-history-icon ${color}`}
                    >
                      <SymptomIcon size={20} />
                    </div>

                    <div className="sakhi-history-details">
                      <div className="sakhi-history-name-row">
                        <h3>{item.symptom}</h3>

                        <span
                          className={`sakhi-history-severity ${severityLabel.toLowerCase()}`}
                        >
                          {severityLabel}
                        </span>
                      </div>

                      <p className="sakhi-history-date">
                        <CalendarDays size={13} />
                        {formatDate(item.date)}
                        <span>
                          • {item.severity}/10
                        </span>
                      </p>

                      {item.notes && (
                        <p className="sakhi-history-notes">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="sakhi-history-delete"
                      onClick={() =>
                        handleDelete(item._id)
                      }
                      disabled={deletingId === item._id}
                      aria-label={`Delete ${item.symptom}`}
                      title="Delete symptom"
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
