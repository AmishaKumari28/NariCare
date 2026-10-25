
import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Activity,
  CalendarDays,
  HeartPulse,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./Insights.css";

// Extract YYYY-MM-DD safely
function dateOnly(value) {
  return String(value || "").slice(0, 10);
}

// Calculate days between two dates
function daysBetween(start, end) {
  const first = Date.parse(`${dateOnly(start)}T00:00:00Z`);
  const second = Date.parse(`${dateOnly(end)}T00:00:00Z`);

  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null;
  }

  return Math.round((second - first) / 86400000);
}

function formatDate(value) {
  const date = Date.parse(`${dateOnly(value)}T00:00:00Z`);

  if (!Number.isFinite(date)) {
    return "Unknown date";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function calculateInsights(symptoms, cycles) {
  // Count symptoms
  const symptomCounts = {};

  symptoms.forEach((item) => {
    const name = String(item.symptom || "Unknown").trim();

    symptomCounts[name] =
      (symptomCounts[name] || 0) + 1;
  });

  const symptomChartData = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const mostFrequentSymptom =
    symptomChartData[0]?.name || null;

  // Average severity
  const severities = symptoms
    .map((item) => Number(item.severity))
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value >= 1 &&
        value <= 10
    );

  const averageSeverity = severities.length
    ? severities.reduce((sum, value) => sum + value, 0) /
      severities.length
    : null;

  // Sort menstrual cycles by start date
  const sortedCycles = [...cycles]
    .filter((cycle) => dateOnly(cycle.startDate))
    .sort((a, b) =>
      dateOnly(a.startDate).localeCompare(
        dateOnly(b.startDate)
      )
    );

  // Calculate consecutive cycle intervals
  const cycleTrendData = [];

  for (let i = 1; i < sortedCycles.length; i++) {
    const length = daysBetween(
      sortedCycles[i - 1].startDate,
      sortedCycles[i].startDate
    );

    if (length !== null && length > 0) {
      cycleTrendData.push({
        name: formatDate(sortedCycles[i].startDate),
        length,
      });
    }
  }

  const cycleLengths = cycleTrendData.map(
    (item) => item.length
  );

  const averageCycleLength = cycleLengths.length
    ? cycleLengths.reduce(
        (sum, length) => sum + length,
        0
      ) / cycleLengths.length
    : null;

  const shortestCycle = cycleLengths.length
    ? Math.min(...cycleLengths)
    : null;

  const longestCycle = cycleLengths.length
    ? Math.max(...cycleLengths)
    : null;

  // Rule-based observations: no AI
  const observations = [];

  if (symptoms.length === 0 && cycles.length === 0) {
    observations.push({
      title: "Start Your Health Journey",
      description:
        "Record your symptoms and menstrual period dates to start discovering patterns.",
      type: "general",
    });
  }

  if (symptomChartData.length > 0) {
    observations.push({
      title: "Most Recorded Symptom",
      description:
        `${mostFrequentSymptom} was recorded ` +
        `${symptomChartData[0].count} time(s), making it ` +
        "your most frequently logged symptom.",
      type: "symptom",
    });
  }

  if (
    averageSeverity !== null &&
    averageSeverity >= 7
  ) {
    observations.push({
      title: "Higher Recorded Severity",
      description:
        "Your average logged symptom severity is 7/10 or higher. Consider discussing persistent or severe symptoms with a healthcare professional.",
      type: "attention",
    });
  }

  if (averageCycleLength !== null) {
    observations.push({
      title: "Your Average Cycle Length",
      description:
        `Your average recorded cycle length is ` +
        `${averageCycleLength.toFixed(1)} days, ` +
        `calculated from ${cycleLengths.length} ` +
        "consecutive cycle interval(s).",
      type: "cycle",
    });
  }

  if (cycleLengths.length >= 2) {
    observations.push({
      title: "Cycle Length Variation",
      description:
        `Your recorded cycle lengths ranged from ` +
        `${shortestCycle} to ${longestCycle} days. ` +
        "Continue tracking to understand your personal pattern.",
      type: "cycle",
    });
  }

  if (symptoms.length > 0) {
    observations.push({
      title: "Keep Tracking Consistently",
      description:
        "Recording symptoms regularly can help you notice changes and prepare useful information for medical appointments.",
      type: "general",
    });
  }

  if (cycles.length === 1) {
    observations.push({
      title: "More Cycle Data Needed",
      description:
        "Record at least two period start dates to calculate your first cycle length.",
      type: "general",
    });
  }

  return {
    symptomChartData,
    mostFrequentSymptom,
    averageSeverity,
    averageCycleLength,
    cycleTrendData,
    shortestCycle,
    longestCycle,
    observations,
  };
}

export default function Insights() {
  const [symptoms, setSymptoms] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHealthData = async () => {
    try {
      setLoading(true);
      setError("");

      const [symptomData, cycleData] = await Promise.all([
        apiRequest("/symptoms"),
        apiRequest("/cycles"),
      ]);

      setSymptoms(
        Array.isArray(symptomData) ? symptomData : []
      );

      setCycles(
        Array.isArray(cycleData) ? cycleData : []
      );
    } catch (err) {
      setError(
        err.message || "Unable to load health insights."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  const {
    symptomChartData,
    mostFrequentSymptom,
    averageSeverity,
    averageCycleLength,
    cycleTrendData,
    shortestCycle,
    longestCycle,
    observations,
  } = calculateInsights(symptoms, cycles);

  return (
    <div className="sakhi-insights-page">
      {/* HEADER */}
      <div className="sakhi-insights-header">
        <div>
          <h1>Insights & Patterns 💜</h1>
          <p>
            Discover trends in your recorded symptoms
            and menstrual cycles.
          </p>
        </div>

        <button
          type="button"
          className="sakhi-insights-refresh"
          onClick={loadHealthData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="sakhi-insights-panel">
          <p>Loading your health insights...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="sakhi-insights-error" role="alert">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!loading && !error && (
        <>
          {/* SUMMARY CARDS */}
          <div className="sakhi-insights-stats">
            <div className="sakhi-insights-stat pink">
              <div className="sakhi-insights-stat-icon">
                <Activity size={23} />
              </div>
              <span>Total Symptoms</span>
              <strong>{symptoms.length}</strong>
              <small>Recorded entries</small>
            </div>

            <div className="sakhi-insights-stat lavender">
              <div className="sakhi-insights-stat-icon">
                <HeartPulse size={23} />
              </div>
              <span>Average Severity</span>
              <strong>
                {averageSeverity !== null
                  ? `${averageSeverity.toFixed(1)}/10`
                  : "N/A"}
              </strong>
              <small>Based on symptom records</small>
            </div>

            <div className="sakhi-insights-stat mint">
              <div className="sakhi-insights-stat-icon">
                <CalendarDays size={23} />
              </div>
              <span>Recorded Periods</span>
              <strong>{cycles.length}</strong>
              <small>Period history entries</small>
            </div>

            <div className="sakhi-insights-stat blue">
              <div className="sakhi-insights-stat-icon">
                <TrendingUp size={23} />
              </div>
              <span>Average Cycle</span>
              <strong>
                {averageCycleLength !== null
                  ? `${averageCycleLength.toFixed(1)} days`
                  : "N/A"}
              </strong>
              <small>Between period start dates</small>
            </div>
          </div>

          {/* CHARTS */}
          <div className="sakhi-insights-charts">
            {/* SYMPTOM FREQUENCY */}
            <section className="sakhi-insights-panel">
              <div className="sakhi-insights-panel-heading">
                <div>
                  <h2>Symptom Frequency</h2>
                  <p>
                    How often each symptom was recorded
                  </p>
                </div>

                <div className="sakhi-insights-heading-icon">
                  <BarChart3 size={20} />
                </div>
              </div>

              {symptomChartData.length === 0 ? (
                <div className="sakhi-insights-empty">
                  <Activity size={29} />
                  <p>
                    No symptoms recorded yet.
                  </p>
                </div>
              ) : (
                <div className="sakhi-insights-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={symptomChartData}
                      margin={{
                        top: 15,
                        right: 10,
                        left: -20,
                        bottom: 45,
                      }}
                    >
                      <CartesianGrid
                        stroke="#f0ebf5"
                        strokeDasharray="4 4"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                          fill: "#92899e",
                        }}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        height={70}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 11,
                          fill: "#92899e",
                        }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Times recorded"
                        fill="#a88bdc"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={55}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            {/* CYCLE TREND */}
            <section className="sakhi-insights-panel">
              <div className="sakhi-insights-panel-heading">
                <div>
                  <h2>Cycle Length Trend</h2>
                  <p>
                    Days between consecutive period starts
                  </p>
                </div>

                <div className="sakhi-insights-heading-icon">
                  <TrendingUp size={20} />
                </div>
              </div>

              {cycleTrendData.length === 0 ? (
                <div className="sakhi-insights-empty">
                  <CalendarDays size={29} />
                  <p>
                    Record at least two period start dates
                    to view your cycle trend.
                  </p>
                </div>
              ) : (
                <div className="sakhi-insights-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={cycleTrendData}
                      margin={{
                        top: 15,
                        right: 15,
                        left: -15,
                        bottom: 45,
                      }}
                    >
                      <CartesianGrid
                        stroke="#f0ebf5"
                        strokeDasharray="4 4"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fill: "#92899e",
                        }}
                        angle={-25}
                        textAnchor="end"
                        height={70}
                      />

                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{
                          fontSize: 11,
                          fill: "#92899e",
                        }}
                        unit="d"
                      />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="length"
                        name="Cycle length"
                        stroke="#9b79d4"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                          fill: "#9b79d4",
                        }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          {/* SECOND ROW */}
          <div className="sakhi-insights-details">
            <section className="sakhi-insights-panel">
              <h2>Most Frequent Symptom</h2>

              {mostFrequentSymptom ? (
                <>
                  <div className="sakhi-insights-feature-icon">
                    <HeartPulse size={27} />
                  </div>

                  <h3 className="sakhi-insights-feature-name">
                    {mostFrequentSymptom}
                  </h3>

                  <p>
                    Recorded{" "}
                    <strong>
                      {symptomChartData[0].count}
                    </strong>{" "}
                    time(s).
                  </p>

                  <p>
                    This shows the symptom you have logged
                    most often, not necessarily the symptom
                    you experience most often.
                  </p>
                </>
              ) : (
                <div className="sakhi-insights-empty">
                  <p>No symptom data available yet.</p>
                </div>
              )}
            </section>

            <section className="sakhi-insights-panel">
              <h2>Cycle Overview</h2>

              <div className="sakhi-insights-detail-row">
                <span>Recorded periods</span>
                <strong>{cycles.length}</strong>
              </div>

              <div className="sakhi-insights-detail-row">
                <span>Calculated intervals</span>
                <strong>{cycleTrendData.length}</strong>
              </div>

              <div className="sakhi-insights-detail-row">
                <span>Shortest cycle</span>
                <strong>
                  {shortestCycle !== null
                    ? `${shortestCycle} days`
                    : "N/A"}
                </strong>
              </div>

              <div className="sakhi-insights-detail-row">
                <span>Longest cycle</span>
                <strong>
                  {longestCycle !== null
                    ? `${longestCycle} days`
                    : "N/A"}
                </strong>
              </div>

              <div className="sakhi-insights-detail-row">
                <span>Average cycle</span>
                <strong>
                  {averageCycleLength !== null
                    ? `${averageCycleLength.toFixed(1)} days`
                    : "N/A"}
                </strong>
              </div>
            </section>
          </div>

          {/* HEALTH OBSERVATIONS */}
          <section className="sakhi-insights-panel sakhi-insights-observations">
            <div className="sakhi-insights-panel-heading">
              <div>
                <h2>Your Health Observations</h2>
                <p>
                  Simple patterns calculated from your
                  saved health records
                </p>
              </div>

              <div className="sakhi-insights-heading-icon">
                <Lightbulb size={20} />
              </div>
            </div>

            <div className="sakhi-insights-observation-grid">
              {observations.map((observation, index) => (
                <div
                  key={index}
                  className={`sakhi-insights-observation ${observation.type}`}
                >
                  <div className="sakhi-insights-observation-icon">
                    <Lightbulb size={18} />
                  </div>

                  <div>
                    <h3>{observation.title}</h3>
                    <p>{observation.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DISCLAIMER */}
          <div className="sakhi-insights-disclaimer">
            <AlertCircle size={20} />
            <p>
              <strong>Important Health Notice:</strong>{" "}
              These insights are descriptive calculations
              based on self-recorded data. They are not
              diagnoses, medical advice, or reliable
              predictions. Consult a qualified healthcare
              professional if you have health concerns.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
