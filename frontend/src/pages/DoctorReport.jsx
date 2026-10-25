
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

import {
  FileText,
  Download,
  Activity,
  CalendarDays,
  AlertCircle,
  HeartPulse,
  RefreshCw,
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./DoctorReport.css";

// Extract date in YYYY-MM-DD format
function dateOnly(value) {
  return String(value || "").slice(0, 10);
}

// Calculate days between two dates
function daysBetween(start, end) {
  const first = Date.parse(
    `${dateOnly(start)}T00:00:00Z`
  );

  const second = Date.parse(
    `${dateOnly(end)}T00:00:00Z`
  );

  if (
    !Number.isFinite(first) ||
    !Number.isFinite(second)
  ) {
    return null;
  }

  return Math.round(
    (second - first) / 86400000
  );
}

// Format date for display
function formatDate(value) {
  const date = Date.parse(
    `${dateOnly(value)}T00:00:00Z`
  );

  if (!Number.isFinite(date)) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  );
}

// Calculate health summary
function getSummary(symptoms, cycles) {
  const sortedCycles = [...cycles].sort(
    (a, b) =>
      dateOnly(a.startDate).localeCompare(
        dateOnly(b.startDate)
      )
  );

  const cycleLengths = [];

  for (
    let i = 1;
    i < sortedCycles.length;
    i++
  ) {
    const length = daysBetween(
      sortedCycles[i - 1].startDate,
      sortedCycles[i].startDate
    );

    if (
      length !== null &&
      length > 0
    ) {
      cycleLengths.push(length);
    }
  }

  const durations = cycles
    .map((cycle) => {
      const length = daysBetween(
        cycle.startDate,
        cycle.endDate
      );

      return length === null ||
        length < 0
        ? null
        : length + 1;
    })
    .filter((value) => value !== null);

  const severities = symptoms
    .map((item) => Number(item.severity))
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value >= 1 &&
        value <= 10
    );

  const average = (values) =>
    values.length
      ? values.reduce(
          (sum, value) => sum + value,
          0
        ) / values.length
      : null;

  const frequency = {};

  symptoms.forEach((item) => {
    const name = String(
      item.symptom || "Unknown"
    ).trim();

    frequency[name] =
      (frequency[name] || 0) + 1;
  });

  const symptomFrequency = Object.entries(
    frequency
  )
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const latestCycle = [
    ...sortedCycles,
  ].reverse()[0];

  return {
    averageCycle: average(cycleLengths),
    averagePeriod: average(durations),
    averageSeverity: average(severities),

    latestPeriod: latestCycle
      ? dateOnly(latestCycle.startDate)
      : null,

    symptomFrequency,
  };
}

export default function DoctorReport() {
  const [symptoms, setSymptoms] = useState([]);
  const [cycles, setCycles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] =
    useState(false);

  // Load saved health records
  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        symptomData,
        cycleData,
      ] = await Promise.all([
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
          "Unable to load health records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const summary = getSummary(
    symptoms,
    cycles
  );

  const hasRecords =
    symptoms.length > 0 ||
    cycles.length > 0;

  const formatAverage = (
    value,
    suffix = ""
  ) =>
    value === null
      ? "Not enough data"
      : `${value.toFixed(1)}${suffix}`;

  // Generate NariCare Doctor Report PDF
  const generatePDF = () => {
    if (
      loading ||
      generating ||
      error ||
      !hasRecords
    ) {
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 18;

      const contentWidth =
        pageWidth - margin * 2;

      const bottomLimit =
        pageHeight - 22;

      let y = 20;

      const addPage = () => {
        pdf.addPage();
        y = 23;
      };

      const ensureSpace = (height) => {
        if (
          y + height > bottomLimit
        ) {
          addPage();
        }
      };

      const addText = (
        value,
        options = {}
      ) => {
        const {
          size = 10,
          bold = false,
          color = [69, 59, 88],
          gap = 4,
        } = options;

        pdf.setFont(
          "helvetica",
          bold ? "bold" : "normal"
        );

        pdf.setFontSize(size);
        pdf.setTextColor(...color);

        const lines =
          pdf.splitTextToSize(
            String(value ?? ""),
            contentWidth
          );

        const lineHeight =
          size * 0.48;

        const height =
          lines.length * lineHeight;

        // Render long text across pages
        lines.forEach((line) => {
          ensureSpace(
            lineHeight + 2
          );

          pdf.text(
            line,
            margin,
            y
          );

          y += lineHeight;
        });

        y += gap;

        return height;
      };

      const addSection = (title) => {
        ensureSpace(22);

        y += 5;

        pdf.setFillColor(
          244,
          238,
          252
        );

        pdf.roundedRect(
          margin,
          y - 6,
          contentWidth,
          12,
          2,
          2,
          "F"
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(12);

        pdf.setTextColor(
          110,
          75,
          171
        );

        pdf.text(
          title,
          margin + 4,
          y + 1
        );

        y += 15;
      };

      const addRecord = (
        title,
        details = []
      ) => {
        const lineHeight = 5;

        ensureSpace(
          10 +
            details.length *
              lineHeight
        );

        addText(title, {
          size: 10,
          bold: true,
          gap: 2,
        });

        details.forEach(
          (detail) => {
            addText(detail, {
              size: 9,
              color: [
                112,
                104,
                126,
              ],
              gap: 2,
            });
          }
        );

        y += 3;
      };

      // ===================================
      // NARICARE PDF HEADER
      // ===================================

      pdf.setFillColor(
        121,
        84,
        201
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        39,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(19);

      pdf.text(
        "NARICARE",
        margin,
        19
      );

      pdf.setFontSize(11);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        "Doctor Consultation Report",
        margin,
        28
      );

      y = 49;

      addText(
        `Generated on: ${new Date().toLocaleDateString(
          "en-IN"
        )}`,
        {
          size: 10,
        }
      );

      addText(
        "Summary of self-recorded menstrual and symptom history",
        {
          size: 10,
          color: [
            130,
            120,
            145,
          ],
        }
      );

      // ===================================
      // HEALTH OVERVIEW
      // ===================================

      addSection(
        "HEALTH OVERVIEW"
      );

      addText(
        `Total symptom records: ${symptoms.length}`
      );

      addText(
        `Total period records: ${cycles.length}`
      );

      addText(
        `Average symptom severity: ${formatAverage(
          summary.averageSeverity,
          "/10"
        )}`
      );

      addText(
        `Average cycle length: ${formatAverage(
          summary.averageCycle,
          " days"
        )}`
      );

      addText(
        `Average period duration: ${formatAverage(
          summary.averagePeriod,
          " days"
        )}`
      );

      addText(
        `Latest recorded period start: ${formatDate(
          summary.latestPeriod
        )}`
      );

      // ===================================
      // SYMPTOM FREQUENCY
      // ===================================

      addSection(
        "SYMPTOM FREQUENCY"
      );

      if (
        summary.symptomFrequency
          .length === 0
      ) {
        addText(
          "No symptoms have been recorded."
        );
      } else {
        summary.symptomFrequency.forEach(
          (item) => {
            addText(
              `${item.name}: ${
                item.count
              } ${
                item.count === 1
                  ? "record"
                  : "records"
              }`
            );
          }
        );
      }

      // ===================================
      // SYMPTOM HISTORY
      // ===================================

      addSection(
        "SYMPTOM HISTORY"
      );

      if (
        symptoms.length === 0
      ) {
        addText(
          "No symptom records available."
        );
      } else {
        const sortedSymptoms = [
          ...symptoms,
        ].sort(
          (a, b) =>
            dateOnly(
              b.date
            ).localeCompare(
              dateOnly(a.date)
            )
        );

        sortedSymptoms.forEach(
          (item, index) => {
            const severity =
              Number(
                item.severity
              );

            addRecord(
              `${index + 1}. ${String(
                item.symptom ||
                  "Unknown symptom"
              )}`,
              [
                `Date: ${formatDate(
                  item.date
                )}`,

                `Severity: ${
                  Number.isFinite(
                    severity
                  )
                    ? `${severity}/10`
                    : "Not recorded"
                }`,

                ...(item.notes
                  ? [
                      `Notes: ${item.notes}`,
                    ]
                  : []),
              ]
            );
          }
        );
      }

      // ===================================
      // MENSTRUAL CYCLE HISTORY
      // ===================================

      addSection(
        "MENSTRUAL CYCLE HISTORY"
      );

      if (
        cycles.length === 0
      ) {
        addText(
          "No period records available."
        );
      } else {
        const sortedCycles = [
          ...cycles,
        ].sort(
          (a, b) =>
            dateOnly(
              b.startDate
            ).localeCompare(
              dateOnly(
                a.startDate
              )
            )
        );

        sortedCycles.forEach(
          (cycle, index) => {
            const duration =
              daysBetween(
                cycle.startDate,
                cycle.endDate
              );

            addRecord(
              `${
                index + 1
              }. Period Record`,
              [
                `Start: ${formatDate(
                  cycle.startDate
                )}`,

                `End: ${formatDate(
                  cycle.endDate
                )}`,

                `Duration: ${
                  duration !== null &&
                  duration >= 0
                    ? `${
                        duration + 1
                      } days`
                    : "Not available"
                }`,
              ]
            );
          }
        );
      }

      // ===================================
      // IMPORTANT HEALTH NOTICE
      // ===================================

      addSection(
        "IMPORTANT HEALTH NOTICE"
      );

      addText(
        "This report contains self-recorded information. " +
          "It is intended to support discussion with a qualified " +
          "healthcare professional. It is not a diagnosis, " +
          "medical assessment, or substitute for professional advice.",
        {
          size: 9,
          color: [
            105,
            99,
            116,
          ],
        }
      );

      // ===================================
      // NARICARE PDF FOOTER
      // ===================================

      const totalPages =
        pdf.internal.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page);

        pdf.setDrawColor(
          230,
          225,
          237
        );

        pdf.line(
          margin,
          pageHeight - 17,
          pageWidth - margin,
          pageHeight - 17
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(8);

        pdf.setTextColor(
          145,
          138,
          154
        );

        pdf.text(
          "NariCare | Private health summary",
          margin,
          pageHeight - 11
        );

        pdf.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 11,
          {
            align: "right",
          }
        );
      }

      // Download PDF with NariCare name
      pdf.save(
        "NariCare_Doctor_Report.pdf"
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to generate the PDF. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="sakhi-report-page">
      {/* Report heading */}
      <div className="sakhi-report-header">
        <div>
          <h1>
            Doctor Report 💜
          </h1>

          <p>
            Generate a professional
            summary of your recorded
            symptoms and menstrual
            cycle history.
          </p>
        </div>

        <button
          type="button"
          className="sakhi-report-refresh"
          onClick={loadRecords}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh Records
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="sakhi-report-alert"
          role="alert"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="sakhi-report-panel">
          Loading your health records...
        </div>
      ) : (
        <>
          {/* Health statistics */}
          <div className="sakhi-report-stats">
            <div className="sakhi-report-stat pink">
              <Activity size={24} />
              <span>
                Symptom Records
              </span>
              <strong>
                {symptoms.length}
              </strong>
            </div>

            <div className="sakhi-report-stat mint">
              <CalendarDays size={24} />
              <span>
                Period Records
              </span>
              <strong>
                {cycles.length}
              </strong>
            </div>

            <div className="sakhi-report-stat lavender">
              <HeartPulse size={24} />
              <span>
                Average Severity
              </span>

              <strong>
                {summary.averageSeverity !==
                null
                  ? `${summary.averageSeverity.toFixed(
                      1
                    )}/10`
                  : "N/A"}
              </strong>
            </div>

            <div className="sakhi-report-stat blue">
              <CalendarDays size={24} />
              <span>
                Average Cycle
              </span>

              <strong>
                {summary.averageCycle !==
                null
                  ? `${summary.averageCycle.toFixed(
                      1
                    )} days`
                  : "N/A"}
              </strong>
            </div>
          </div>

          {/* Download and preview */}
          <div className="sakhi-report-content">
            <section className="sakhi-report-panel sakhi-report-download">
              <div className="sakhi-report-file-icon">
                <FileText size={34} />
              </div>

              <h2>
                Your Health Summary
              </h2>

              <p>
                Download a PDF
                containing your symptom
                frequency, severity
                levels, notes, period
                history, and calculated
                averages.
              </p>

              <button
                type="button"
                className="sakhi-report-download-btn"
                onClick={generatePDF}
                disabled={
                  generating ||
                  Boolean(error) ||
                  !hasRecords
                }
              >
                <Download size={18} />

                {generating
                  ? "Generating PDF..."
                  : "Download Doctor Report"}
              </button>

              {!hasRecords && (
                <p className="sakhi-report-empty-note">
                  Record a symptom or
                  period first to
                  generate a report.
                </p>
              )}
            </section>

            <section className="sakhi-report-panel sakhi-report-preview">
              <h2>
                Report Preview
              </h2>

              <div className="sakhi-report-preview-row">
                <span>
                  Total symptoms logged
                </span>

                <strong>
                  {symptoms.length}
                </strong>
              </div>

              <div className="sakhi-report-preview-row">
                <span>
                  Total periods logged
                </span>

                <strong>
                  {cycles.length}
                </strong>
              </div>

              <div className="sakhi-report-preview-row">
                <span>
                  Average period duration
                </span>

                <strong>
                  {summary.averagePeriod !==
                  null
                    ? `${summary.averagePeriod.toFixed(
                        1
                      )} days`
                    : "Not enough data"}
                </strong>
              </div>

              <div className="sakhi-report-preview-row">
                <span>
                  Latest period start
                </span>

                <strong>
                  {formatDate(
                    summary.latestPeriod
                  )}
                </strong>
              </div>

              <div className="sakhi-report-preview-row">
                <span>
                  Most recorded symptom
                </span>

                <strong>
                  {summary.symptomFrequency[0]
                    ?.name ||
                    "Not available"}
                </strong>
              </div>
            </section>
          </div>

          {/* Health disclaimer */}
          <div className="sakhi-report-notice">
            <AlertCircle size={19} />

            <p>
              <strong>
                Important:
              </strong>{" "}
              Your report contains
              personal health
              information. Review it
              before sharing it with a
              doctor or anyone else.
              It is a summary of
              self-recorded data,
              not a medical diagnosis.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
