import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  XCircle,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { resumeApi } from "../api/index.js";

export default function ResumeAnalysis() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalysis() {
      if (!resumeId) {
        setError("No resume ID provided.");
        setLoading(false);
        return;
      }

      try {
        let data = await resumeApi.getAnalysis(resumeId);
        setAnalysis(data.analysis);
      } catch (err) {
        if (err.message.includes("not found")) {
          // Analysis not found, try to trigger it
          try {
            // We might need a target job description.
            // For simplicity, we'll call analyze without one to use the stored one.
            const analyzedData = await resumeApi.analyze(resumeId, {});
            setAnalysis(analyzedData.analysis);
          } catch (analyzeErr) {
            setError("Could not analyze resume: " + analyzeErr.message);
          }
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">Analyzing your resume...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <p>No analysis available for this resume.</p>
          <Link to="/upload" className="primary-button">Upload another</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">LATEST ANALYSIS</span>
          <h1>Resume analysis</h1>
          <p>Analyzed Resume</p>
        </div>

        <Link to="/builder" className="primary-button">
          Fix my resume
          <ArrowRight size={16} />
        </Link>
      </div>

      <section className="analysis-hero content-card">
        <div className="analysis-score">
          <div className="analysis-ring">
            <div>
              <strong>{analysis.atsScore}</strong>
              <span>ATS score</span>
            </div>
          </div>
        </div>

        <div className="analysis-summary">
          <div className={`warning-label ${analysis.atsScore >= 80 ? 'success-text' : 'danger-text'}`}>
            {analysis.atsScore >= 80 ? 'Strong' : 'Needs improvement'}
          </div>

          <h2>
            {analysis.summary}
          </h2>

          <div className="large-progress">
            <span style={{ width: `${analysis.atsScore}%` }} />
          </div>

          <div className="progress-caption">
            <span>Current score: {analysis.atsScore}</span>
            <span>Recommended: 80+</span>
          </div>
        </div>
      </section>

      <div className="analysis-metrics">
        <Metric
          title="JD match"
          value={`${analysis.jobMatchScore}%`}
          description={`${analysis.missingKeywords.length} important terms missing`}
        />

        <Metric
          title="Keywords found"
          value={analysis.matchedKeywords.length}
          description={`${analysis.matchedKeywords.length} strong matches`}
        />

        <Metric
          title="Roast level"
          value={analysis.atsScore < 50 ? "High" : analysis.atsScore < 80 ? "Medium" : "Low"}
          description="Based on identified gaps"
        />
      </div>

      <div className="analysis-grid">
        <section className="content-card">
          <div className="card-header">
            <div>
              <h2>Keyword match</h2>
              <p>What your resume contains vs. what it needs.</p>
            </div>
          </div>

          <div className="analysis-block">
            <div className="analysis-block-title success-text">
              <CheckCircle2 size={16} />
              Matching keywords
            </div>

            <div className="tag-container">
              {analysis.matchedKeywords.map((item) => (
                <span className="tag success-tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="analysis-block">
            <div className="analysis-block-title danger-text">
              <XCircle size={16} />
              Missing keywords
            </div>

            <div className="tag-container">
              {analysis.missingKeywords.map((item) => (
                <span className="tag danger-tag" key={item.keyword}>
                  {item.keyword}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="card-header">
            <div>
              <h2>What needs work</h2>
              <p>Highest-impact improvements.</p>
            </div>

            <Lightbulb size={18} />
          </div>

          <div className="issue-list">
            {analysis.priorityFixes.map((fix, idx) => (
              <div className="issue-item" key={idx}>
                <strong>Priority {idx + 1}</strong>
                <p>{fix}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="content-card roast-card">
        <div className="card-header">
          <div>
            <h2>Bullet point roast</h2>
            <p>Turn task-based statements into measurable achievements.</p>
          </div>
        </div>

        {analysis.weakBullets.length === 0 ? (
          <div className="empty-state">No weak bullets detected! Your impact is clear.</div>
        ) : (
          analysis.weakBullets.map((bullet, idx) => (
            <div className="bullet-comparison" key={idx}>
              <div className="bullet-box before">
                <span>BEFORE</span>
                <p>{bullet.original}</p>
              </div>

              <div className="bullet-arrow">
                <ArrowRight size={18} />
              </div>

              <div className="bullet-box after">
                <span>BETTER VERSION</span>
                <p>{bullet.suggestion}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}

function Metric({ title, value, description }) {
  return (
    <div className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}
