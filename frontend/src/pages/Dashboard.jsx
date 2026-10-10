import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  Plus,
  TrendingUp,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { resumeApi } from "../api/index.js";

function StatCard({ label, value, description, icon: Icon }) {
  return (
    <div className="stat-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span className="stat-label">{label}</span>

        <div
          style={{
            padding: "6px",
            background: "var(--primary-soft)",
            color: "var(--primary)",
            borderRadius: "6px",
          }}
        >
          <Icon size={16} />
        </div>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-change">
        <span
          style={{
            color: "var(--text-soft)",
            fontSize: "12px",
          }}
        >
          {description}
        </span>
      </div>
    </div>
  );
}

function ProgressItem({ label, value }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        <span style={{ color: "var(--text-soft)" }}>{label}</span>
        <span style={{ color: "var(--text)" }}>{value}%</span>
      </div>

      <div
        style={{
          height: "6px",
          background: "var(--border-soft)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "var(--primary)",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResumes() {
      try {
        const data = await resumeApi.getResumes();
        setResumes(data.resumes || []);
      } catch (err) {
        setError(err.message || "Unable to load resumes.");
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, []);

  /* ================================
     CALCULATED DATA
  ================================= */

  const averageScore = useMemo(() => {
    if (!resumes.length) return 0;

    return Math.round(
      resumes.reduce(
        (sum, resume) => sum + Number(resume.score || 0),
        0
      ) / resumes.length
    );
  }, [resumes]);

  const bestScore = useMemo(() => {
    if (!resumes.length) return 0;

    return Math.max(
      ...resumes.map((resume) => Number(resume.score || 0))
    );
  }, [resumes]);

  /*
   * Use real backend values when available.
   * If your backend later stores keywordScore,
   * experienceScore and projectScore, these will
   * automatically use them.
   */
  const healthMetrics = useMemo(() => {
    if (!resumes.length) {
      return {
        keywords: 0,
        experience: 0,
        projects: 0,
      };
    }

    const keywordScores = resumes
      .map((resume) => Number(resume.keywordScore))
      .filter((value) => !Number.isNaN(value));

    const experienceScores = resumes
      .map((resume) => Number(resume.experienceScore))
      .filter((value) => !Number.isNaN(value));

    const projectScores = resumes
      .map((resume) => Number(resume.projectScore))
      .filter((value) => !Number.isNaN(value));

    return {
      keywords: keywordScores.length
        ? Math.round(
            keywordScores.reduce((a, b) => a + b, 0) /
              keywordScores.length
          )
        : 0,

      experience: experienceScores.length
        ? Math.round(
            experienceScores.reduce((a, b) => a + b, 0) /
              experienceScores.length
          )
        : 0,

      projects: projectScores.length
        ? Math.round(
            projectScores.reduce((a, b) => a + b, 0) /
              projectScores.length
          )
        : 0,
    };
  }, [resumes]);

  const healthStatus = useMemo(() => {
    if (!resumes.length) return "No data yet";

    if (averageScore >= 80) return "Strong";
    if (averageScore >= 60) return "Needs improvement";

    return "Needs work";
  }, [averageScore, resumes.length]);

  if (loading) {
    return (
      <div
        className="page-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            color: "var(--text-soft)",
            fontSize: "14px",
          }}
        >
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="page-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            color: "var(--danger)",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* HEADER */}

      <div className="page-heading">
        <div>
          <span className="page-eyebrow">
            WORKSPACE OVERVIEW
          </span>

          <h1>Good to see you.</h1>

          <p>
            Review your resume performance and improve your
            chances of getting noticed.
          </p>
        </div>

        <Link to="/upload" className="primary-button">
          <Plus size={18} />
          New analysis
        </Link>
      </div>

      {/* STATS */}

      <div className="stats-grid">
        <StatCard
          label="Resumes analyzed"
          value={resumes.length}
          description={
            resumes.length
              ? `${resumes.length} resume${
                  resumes.length > 1 ? "s" : ""
                } in workspace`
              : "Upload a resume to begin"
          }
          icon={FileText}
        />

        <StatCard
          label="Average ATS score"
          value={`${averageScore}%`}
          description={
            resumes.length
              ? "Calculated from your resumes"
              : "No score yet"
          }
          icon={TrendingUp}
        />

        <StatCard
          label="Best score"
          value={`${bestScore}%`}
          description={
            resumes.length
              ? "Highest score in your workspace"
              : "No score yet"
          }
          icon={CheckCircle2}
        />
      </div>

      {/* MAIN CONTENT */}

      <div className="dashboard-grid">
        {/* RECENT RESUMES */}

        <section className="content-card">
          <div className="card-header">
            <div>
              <h2>Recent resumes</h2>
              <p>Your latest resume activity</p>
            </div>

            {resumes.length > 0 && (
              <Link
                to="/upload"
                className="secondary-button"
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
              >
                Analyze another
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>

          {resumes.length === 0 ? (
            <div
              style={{
                padding: "60px 24px",
                textAlign: "center",
                color: "var(--text-soft)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "16px",
                  opacity: 0.5,
                }}
              >
                <FileText size={40} />
              </div>

              <h3
                style={{
                  color: "var(--text)",
                  fontSize: "16px",
                  marginBottom: "8px",
                }}
              >
                No resumes yet
              </h3>

              <p
                style={{
                  fontSize: "13px",
                  maxWidth: "300px",
                  margin: "0 auto 24px",
                }}
              >
                Upload your resume to get an ATS score,
                keyword analysis, section feedback and
                improvement suggestions.
              </p>

              <Link
                to="/upload"
                className="primary-button"
              >
                <Upload size={17} />
                Upload resume
              </Link>
            </div>
          ) : (
            <div className="resume-list">
              {resumes.slice(0, 5).map((resume) => (
                <Link
                  to={`/analysis?id=${resume.id}`}
                  className="resume-row"
                  key={resume.id}
                >
                  <div className="resume-main">
                    <div className="resume-file-icon">
                      <FileText size={18} />
                    </div>

                    <div className="resume-info">
                      <strong>
                        {resume.name}
                      </strong>

                      <span>
                        {resume.role || "Resume"} ·{" "}
                        {resume.date
                          ? new Date(
                              resume.date
                            ).toLocaleDateString()
                          : "Recently uploaded"}
                      </span>
                    </div>
                  </div>

                  <div className="resume-meta">
                    <div className="resume-score-box">
                      <span className="resume-score-val">
                        {resume.score || 0}
                      </span>

                      <span className="resume-score-lbl">
                        /100
                      </span>
                    </div>

                    <span
                      className={`status-badge ${
                        (resume.score || 0) >= 80
                          ? "success"
                          : (resume.score || 0) >= 60
                          ? "warning"
                          : "danger"
                      }`}
                    >
                      {resume.status ||
                        ((resume.score || 0) >= 80
                          ? "Strong"
                          : (resume.score || 0) >= 60
                          ? "Average"
                          : "Needs work")}
                    </span>

                    <div className="row-action">
                      <ArrowUpRight size={17} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* RESUME HEALTH */}

        <section className="content-card">
          <div className="card-header">
            <div>
              <h2>Resume health</h2>

              <p>
                {resumes.length
                  ? `Based on ${resumes.length} uploaded resume${
                      resumes.length > 1 ? "s" : ""
                    }`
                  : "No resume data yet"}
              </p>
            </div>

            <div
              style={{
                padding: "6px",
                background: "var(--primary-soft)",
                color: "var(--primary)",
                borderRadius: "6px",
              }}
            >
              {resumes.length ? (
                <TrendingUp size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
            </div>
          </div>

          {!resumes.length ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <AlertCircle
                size={34}
                style={{
                  color: "var(--text-soft)",
                  marginBottom: "12px",
                }}
              />

              <h3
                style={{
                  color: "var(--text)",
                  marginBottom: "8px",
                  fontSize: "16px",
                }}
              >
                No resume health data
              </h3>

              <p
                style={{
                  color: "var(--text-soft)",
                  fontSize: "13px",
                  marginBottom: "20px",
                }}
              >
                Upload a resume to generate your
                health metrics.
              </p>

              <Link
                to="/upload"
                className="primary-button"
              >
                <Upload size={16} />
                Upload resume
              </Link>
            </div>
          ) : (
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize: "38px",
                      color: "var(--text)",
                      lineHeight: 1,
                    }}
                  >
                    {averageScore}%
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "var(--text-soft)",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Average ATS score
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color:
                      averageScore >= 80
                        ? "var(--success)"
                        : "var(--text-soft)",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {averageScore >= 80 ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}

                  {healthStatus}
                </div>
              </div>

              <div
                style={{
                  height: "8px",
                  background: "var(--border-soft)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: `${averageScore}%`,
                    height: "100%",
                    background: "var(--primary)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>

              {/* Only show real backend metrics.
                  No fake default values. */}

              {healthMetrics.keywords ||
              healthMetrics.experience ||
              healthMetrics.projects ? (
                <div style={{ marginBottom: "24px" }}>
                  <ProgressItem
                    label="Keywords"
                    value={healthMetrics.keywords}
                  />

                  <ProgressItem
                    label="Experience"
                    value={healthMetrics.experience}
                  />

                  <ProgressItem
                    label="Projects"
                    value={healthMetrics.projects}
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: "16px",
                    background: "var(--primary-soft)",
                    borderRadius: "10px",
                    marginBottom: "24px",
                    color: "var(--text-soft)",
                    fontSize: "12px",
                  }}
                >
                  Detailed health metrics will appear
                  after your resume analysis is completed.
                </div>
              )}

              <Link
                to="/analysis"
                className="primary-button"
                style={{
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                Review latest analysis
                <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}