
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  CalendarDays,
  Heart,
  ClipboardList,
  ArrowRight,
  AlertCircle,
  Plus,
  TrendingUp,
  Sparkles,
  HeartPulse,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import { apiRequest } from "../services/api";
import "./Dashboard.css";

const CHART_COLORS = [
  "#e99bbd",
  "#9a82dd",
  "#70c9c2",
  "#8caee9",
  "#f1c18e",
];

function daysBetween(firstDate, secondDate) {
  const first = Date.parse(`${firstDate}T00:00:00Z`);
  const second = Date.parse(`${secondDate}T00:00:00Z`);

  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null;
  }

  return Math.round((second - first) / 86400000);
}

function formatDate(dateString) {
  if (!dateString) return "Not available";

  const date = new Date(
    `${String(dateString).slice(0, 10)}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}) {
  return (
    <div className={`sakhi-stat-card ${color}`}>
      <div className="sakhi-stat-top">
        <span className="sakhi-stat-label">
          {title}
        </span>

        <div className="sakhi-stat-icon">
          <Icon size={21} />
        </div>
      </div>

      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

export default function Dashboard() {
  const [symptoms, setSymptoms] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get the logged-in user's name
  let user = {};

  try {
    user = JSON.parse(
      sessionStorage.getItem("sakhi_user") ||
      localStorage.getItem("sakhi_user") ||
      "{}"
    );
  } catch {
    user = {};
  }

  const userName =
    typeof user.name === "string" && user.name.trim()
      ? user.name.trim().split(/\s+/)[0]
      : "there";

  // Load data automatically when Dashboard opens
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [symptomData, cycleData] =
          await Promise.all([
            apiRequest("/symptoms"),
            apiRequest("/cycles"),
          ]);

        setSymptoms(
          Array.isArray(symptomData)
            ? symptomData
            : []
        );

        setCycles(
          Array.isArray(cycleData)
            ? cycleData
            : []
        );
      } catch (err) {
        setError(
          err.message ||
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Sort records from newest to oldest
  const sortedSymptoms = [...symptoms].sort(
    (a, b) =>
      String(b.date || "").localeCompare(
        String(a.date || "")
      )
  );

  const sortedCycles = [...cycles].sort(
    (a, b) =>
      String(b.startDate || "").localeCompare(
        String(a.startDate || "")
      )
  );

  // Calculate average severity
  const validSeverities = symptoms
    .map((item) => Number(item.severity))
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value >= 1 &&
        value <= 10
    );

  const averageSeverity = validSeverities.length
    ? (
        validSeverities.reduce(
          (sum, value) => sum + value,
          0
        ) / validSeverities.length
      ).toFixed(1)
    : null;

  // Calculate average cycle length
  const cycleLengths = [];

  for (
    let i = 0;
    i < sortedCycles.length - 1;
    i++
  ) {
    const length = daysBetween(
      String(sortedCycles[i + 1].startDate).slice(0, 10),
      String(sortedCycles[i].startDate).slice(0, 10)
    );

    if (
      length !== null &&
      length >= 15 &&
      length <= 90
    ) {
      cycleLengths.push(length);
    }
  }

  const averageCycleLength = cycleLengths.length
    ? Math.round(
        cycleLengths.reduce(
          (sum, length) => sum + length,
          0
        ) / cycleLengths.length
      )
    : null;

  // Count symptom frequency
  const symptomCounts = {};

  symptoms.forEach((item) => {
    const name = String(
      item.symptom || "Unknown"
    ).trim();

    symptomCounts[name] =
      (symptomCounts[name] || 0) + 1;
  });

  const symptomChartData = Object.entries(
    symptomCounts
  )
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Estimate next period from recorded cycle history
  let nextPeriodDate = null;

  if (
    sortedCycles.length > 0 &&
    averageCycleLength !== null
  ) {
    const latestStartDate = String(
      sortedCycles[0].startDate || ""
    ).slice(0, 10);

    const next = new Date(
      `${latestStartDate}T00:00:00Z`
    );

    if (!Number.isNaN(next.getTime())) {
      next.setUTCDate(
        next.getUTCDate() + averageCycleLength
      );

      nextPeriodDate = next
        .toISOString()
        .slice(0, 10);
    }
  }

  const recentSymptoms = sortedSymptoms.slice(0, 4);

  return (
    <div className="sakhi-dashboard">
      {/* Personalized welcome heading */}
      <div className="sakhi-dashboard-header">
        <div>
          <h1>Welcome, {userName} 💜</h1>

          <p>
            Here's your personal health overview.
            Take care of yourself today!
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="sakhi-dashboard-error"
          role="alert"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="sakhi-panel">
          Loading your health dashboard...
        </div>
      ) : error ? null : (
        <>
          {/* Four pastel statistics cards */}
          <div className="sakhi-stats-grid">
            <StatCard
              icon={ClipboardList}
              title="Symptoms Logged"
              value={symptoms.length}
              subtitle="Total recorded symptoms"
              color="pink"
            />

            <StatCard
              icon={Heart}
              title="Periods Logged"
              value={cycles.length}
              subtitle="Total period records"
              color="mint"
            />

            <StatCard
              icon={Activity}
              title="Average Severity"
              value={
                averageSeverity !== null
                  ? `${averageSeverity}/10`
                  : "N/A"
              }
              subtitle="Based on symptom records"
              color="lavender"
            />

            <StatCard
              icon={CalendarDays}
              title="Average Cycle"
              value={
                averageCycleLength !== null
                  ? `${averageCycleLength} days`
                  : "N/A"
              }
              subtitle="Based on period history"
              color="blue"
            />
          </div>

          {/* Frequency graph and recent activity */}
          <div className="sakhi-dashboard-main-grid">
            {/* Symptom Frequency Graph */}
            <div className="sakhi-panel">
              <div className="sakhi-panel-heading">
                <div>
                  <h2>Symptom Frequency</h2>

                  <p>
                    Your most commonly recorded symptoms
                  </p>
                </div>

                <TrendingUp
                  size={19}
                  color="#9279d4"
                />
              </div>

              {symptomChartData.length === 0 ? (
                <div className="sakhi-empty-state">
                  Add symptoms to see your frequency
                  graph.
                </div>
              ) : (
                <div className="sakhi-chart-container">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={symptomChartData}
                      layout="vertical"
                      margin={{
                        top: 8,
                        right: 20,
                        left: 10,
                        bottom: 8,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#f0eef6"
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={95}
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Frequency"
                        radius={[0, 5, 5, 0]}
                        barSize={21}
                      >
                        {symptomChartData.map(
                          (item, index) => (
                            <Cell
                              key={item.name}
                              fill={
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="sakhi-panel">
              <div className="sakhi-panel-heading">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Your latest health records</p>
                </div>

                <Link to="/symptoms">
                  View all
                </Link>
              </div>

              {recentSymptoms.length === 0 ? (
                <div className="sakhi-empty-state">
                  No symptoms recorded yet.
                </div>
              ) : (
                <div className="sakhi-activity-list">
                  {recentSymptoms.map((item) => (
                    <div
                      className="sakhi-activity-item"
                      key={item._id}
                    >
                      <div className="sakhi-activity-dot" />

                      <div className="sakhi-activity-info">
                        <strong>
                          {item.symptom}
                        </strong>

                        <span>
                          {formatDate(item.date)}
                        </span>
                      </div>

                      <span className="sakhi-severity-badge">
                        {item.severity}/10
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="sakhi-recent-footer">
                <Link to="/symptoms">
                  View symptom history
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Wellness banner */}
          <div className="sakhi-wellness-card">
            <div className="sakhi-wellness-icon">
              <HeartPulse size={28} />
            </div>

            <div className="sakhi-wellness-text">
              <h3>Your Wellness Journey</h3>

              <p>
                Small steps toward better health make
                a big difference. Keep tracking your
                symptoms and menstrual cycle.
              </p>

              {nextPeriodDate && (
                <p className="sakhi-period-estimate">
                  <CalendarDays size={15} />

                  Estimated next period:{" "}
                  <strong>
                    {formatDate(nextPeriodDate)}
                  </strong>
                </p>
              )}
            </div>

            <Sparkles
              className="sakhi-wellness-sparkle"
              size={42}
            />
          </div>

          {/* Quick Actions */}
          <div className="sakhi-quick-actions">
            <div className="sakhi-quick-heading">
              <h2>Quick Actions</h2>

              <p>
                Easily access your health tracking tools
              </p>
            </div>

            <div className="sakhi-quick-buttons">
              <Link
                to="/symptoms"
                className="sakhi-action-button purple"
              >
                <Plus size={18} />
                Log Symptoms
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/cycle"
                className="sakhi-action-button teal"
              >
                <CalendarDays size={18} />
                Track Period
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <p className="sakhi-dashboard-disclaimer">
            Health patterns and period estimates are
            based on self-recorded data. They are not
            medical diagnoses or reliable contraception
            predictions.
          </p>
        </>
      )}
    </div>
  );
}
