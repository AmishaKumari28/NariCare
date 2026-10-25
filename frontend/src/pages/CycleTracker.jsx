
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Heart,
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./CycleTracker.css";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateOnly(value) {
  return String(value || "").slice(0, 10);
}

function toUTCDate(value) {
  const date = new Date(`${dateOnly(value)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(first, second) {
  const a = toUTCDate(first);
  const b = toUTCDate(second);

  if (!a || !b) return null;

  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

function addDays(value, amount) {
  const date = toUTCDate(value);
  if (!date) return null;

  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  const date = toUTCDate(value);
  if (!date) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatMonth(value) {
  const date = toUTCDate(value);
  if (!date) return "Unknown month";

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function periodDuration(cycle) {
  const duration = daysBetween(cycle.startDate, cycle.endDate);
  return duration === null ? null : duration + 1;
}

export default function CycleTracker() {
  const [cycles, setCycles] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const today = todayString();
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const fetchCycles = async () => {
    try {
      setError("");
      const data = await apiRequest("/cycles");
      setCycles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load cycles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const sortedCycles = [...cycles].sort((a, b) =>
    dateOnly(b.startDate).localeCompare(dateOnly(a.startDate))
  );

  const cycleLengths = [];

  for (let i = 0; i < sortedCycles.length - 1; i++) {
    const length = daysBetween(
      sortedCycles[i + 1].startDate,
      sortedCycles[i].startDate
    );

    if (length !== null && length > 0) {
      cycleLengths.push(length);
    }
  }

  const averageCycleLength = cycleLengths.length
    ? Math.round(
        cycleLengths.reduce((sum, value) => sum + value, 0) /
          cycleLengths.length
      )
    : null;

  const validDurations = cycles
    .map(periodDuration)
    .filter((value) => value !== null && value > 0);

  const averagePeriodDuration = validDurations.length
    ? Math.round(
        validDurations.reduce((sum, value) => sum + value, 0) /
          validDurations.length
      )
    : null;

  const latestCycle = sortedCycles[0] || null;
  const latestStart = latestCycle
    ? dateOnly(latestCycle.startDate)
    : null;

  const daysSinceStart = latestStart
    ? daysBetween(latestStart, today)
    : null;

  const currentCycleDay =
    daysSinceStart !== null && daysSinceStart >= 0
      ? daysSinceStart + 1
      : null;

  const nextPeriodDate =
    latestStart && averageCycleLength
      ? addDays(latestStart, averageCycleLength)
      : null;

  const progress =
    currentCycleDay && averageCycleLength
      ? Math.min(
          100,
          Math.round((currentCycleDay / averageCycleLength) * 100)
        )
      : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/cycles", {
        method: "POST",
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });

      setStartDate("");
      setEndDate("");
      setShowForm(false);

      await fetchCycles();
      setSuccess("Period record saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save period.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this period record?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await apiRequest(`/cycles/${id}`, {
        method: "DELETE",
      });

      setCycles((previous) =>
        previous.filter((cycle) => cycle._id !== id)
      );

      setSuccess("Period record deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete period.");
    } finally {
      setDeletingId(null);
    }
  };

  const changeMonth = (offset) => {
    setViewMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + offset,
          1
        )
    );
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const calendarMonthLabel = viewMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const getCalendarDate = (day) => {
    return [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");
  };

  const isPeriodDay = (value) =>
    cycles.some((cycle) => {
      const start = dateOnly(cycle.startDate);
      const end = dateOnly(cycle.endDate);
      return start && end && value >= start && value <= end;
    });

  // Estimated fertile window is intentionally not displayed:
  // cycle-history estimates are not reliable contraception guidance.

  return (
    <div className="sakhi-cycle-page">
      <header className="sakhi-cycle-header">
        <h1>Menstrual Cycle Tracker</h1>
        <p>Know your cycle, plan ahead, and stay in control.</p>
      </header>

      {error && (
        <div className="sakhi-cycle-alert error" role="alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="sakhi-cycle-alert success" role="status">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="sakhi-cycle-panel">Loading your cycles...</div>
      ) : (
        <>
          <div className="sakhi-cycle-layout">
            {/* CURRENT CYCLE */}
            <section className="sakhi-cycle-current">
              <div className="sakhi-cycle-current-heading">
                <div className="sakhi-cycle-current-icon">
                  <CalendarDays size={24} />
                </div>
                <h2>Current Cycle</h2>
              </div>

              <div className="sakhi-cycle-day">
                {currentCycleDay
                  ? `Day ${currentCycleDay}`
                  : "No cycle recorded"}
              </div>

              <p className="sakhi-cycle-day-subtitle">
                {averageCycleLength
                  ? `Average cycle: ${averageCycleLength} days`
                  : "Log at least two periods to calculate cycle length"}
              </p>

              <div className="sakhi-cycle-progress-track">
                <div
                  className="sakhi-cycle-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="sakhi-cycle-details">
                <div>
                  <span>Period Started</span>
                  <strong>{formatDate(latestStart)}</strong>
                </div>

                <div>
                  <span>Expected Next Period</span>
                  <strong>{formatDate(nextPeriodDate)}</strong>
                </div>

                <div>
                  <span>Average Period Length</span>
                  <strong>
                    {averagePeriodDuration
                      ? `${averagePeriodDuration} days`
                      : "Not available"}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="sakhi-cycle-primary-button"
                onClick={() => setShowForm((previous) => !previous)}
              >
                <Plus size={17} />
                {showForm ? "Close Form" : "Add Period Dates"}
              </button>
            </section>

            {/* CALENDAR */}
            <section className="sakhi-cycle-panel sakhi-cycle-calendar">
              <div className="sakhi-calendar-heading">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={19} />
                </button>

                <h2>{calendarMonthLabel}</h2>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRight size={19} />
                </button>
              </div>

              <div className="sakhi-calendar-grid">
                {WEEKDAYS.map((day) => (
                  <div className="sakhi-calendar-weekday" key={day}>
                    {day}
                  </div>
                ))}

                {calendarCells.map((day, index) => {
                  if (day === null) {
                    return (
                      <div
                        key={`blank-${index}`}
                        className="sakhi-calendar-empty"
                      />
                    );
                  }

                  const value = getCalendarDate(day);
                  const period = isPeriodDay(value);
                  const isToday = value === today;

                  return (
                    <div
                      key={value}
                      className={[
                        "sakhi-calendar-date",
                        period ? "period" : "",
                        isToday ? "today" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      title={
                        period
                          ? "Recorded period day"
                          : isToday
                          ? "Today"
                          : value
                      }
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="sakhi-calendar-legend">
                <span>
                  <i className="sakhi-legend-dot period" />
                  Period Days
                </span>
                <span>
                  <i className="sakhi-legend-dot today" />
                  Today
                </span>
              </div>
            </section>

            {/* HISTORY */}
            <section className="sakhi-cycle-panel sakhi-cycle-history">
              <div className="sakhi-cycle-history-heading">
                <h2>Cycle History</h2>
                <span>{cycles.length} records</span>
              </div>

              {sortedCycles.length === 0 ? (
                <div className="sakhi-cycle-empty">
                  <Heart size={28} />
                  <p>No periods recorded yet.</p>
                </div>
              ) : (
                <div className="sakhi-cycle-history-list">
                  {sortedCycles.map((cycle, index) => {
                    const nextOlder = sortedCycles[index + 1];
                    const cycleLength = nextOlder
                      ? daysBetween(
                          nextOlder.startDate,
                          cycle.startDate
                        )
                      : null;

                    return (
                      <div
                        className="sakhi-cycle-history-item"
                        key={cycle._id}
                      >
                        <div>
                          <strong>{formatMonth(cycle.startDate)}</strong>
                          <span>
                            {formatDate(cycle.startDate)} –{" "}
                            {formatDate(cycle.endDate)}
                          </span>
                          <small>
                            Period: {periodDuration(cycle) ?? "—"} days
                            {cycleLength !== null && cycleLength > 0
                              ? ` • Cycle: ${cycleLength} days`
                              : ""}
                          </small>
                        </div>

                        <button
                          type="button"
                          className="sakhi-cycle-delete"
                          onClick={() => handleDelete(cycle._id)}
                          disabled={deletingId === cycle._id}
                          aria-label={`Delete period starting ${formatDate(
                            cycle.startDate
                          )}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ADD PERIOD FORM */}
          {showForm && (
            <section className="sakhi-cycle-panel sakhi-cycle-form-panel">
              <h2>Add Period Dates</h2>
              <p>Enter the start and end dates of your period.</p>

              <form onSubmit={handleSubmit}>
                <div className="sakhi-cycle-form-fields">
                  <div>
                    <label htmlFor="period-start">Period Start Date</label>
                    <input
                      id="period-start"
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="period-end">Period End Date</label>
                    <input
                      id="period-end"
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(event) =>
                        setEndDate(event.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="sakhi-cycle-primary-button"
                  disabled={saving}
                >
                  <Plus size={17} />
                  {saving ? "Saving..." : "Save Period"}
                </button>
              </form>
            </section>
          )}

          <p className="sakhi-cycle-disclaimer">
            Cycle length and next-period estimates are based on your
            recorded history. Period timing can vary, and these estimates
            should not be used for contraception or medical diagnosis.
          </p>
        </>
      )}
    </div>
  );
}
