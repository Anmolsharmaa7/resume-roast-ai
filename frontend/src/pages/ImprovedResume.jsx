import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Printer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resumeApi } from "../api/index.js";

export default function ImprovedResume() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id");
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchResume() {
      if (!resumeId) {
        setError("No resume ID provided.");
        setLoading(false);
        return;
      }

      try {
        const versionsData = await resumeApi.getVersions(resumeId);
        if (versionsData.versions.length > 0) {
          setResumeData(versionsData.versions[0].content);
        } else {
          setError("No improved version found.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, [resumeId]);

  async function handleDownload() {
    if (!resumeId) return;
    setDownloading(true);
    try {
      const response = await resumeApi.download(resumeId);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Improved_Resume_${resumeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">Loading final resume...</div>
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

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">FINAL VERSION</span>
          <h1>Improved resume</h1>
          <p>
            Your resume has been tightened for the target role.
          </p>
        </div>

        <div className="button-group">
          <button
            className="secondary-button"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            Print
          </button>

          <button
            className="primary-button"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download size={15} />
            {downloading ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="success-banner">
        <CheckCircle2 size={18} />

        <div>
          <strong>Ready to apply</strong>
          <span>
            Improved version generated based on AI analysis.
          </span>
        </div>
      </div>

      <div className="back-link">
        <Link to="/builder">
          <ArrowLeft size={14} />
          Back to builder
        </Link>
      </div>

      <section className="content-card final-resume-card">
        <div className="preview-header">
          <span>Final resume</span>
          <span>ATS-friendly</span>
        </div>

        <article className="resume-document final">
          <header className="resume-header">
            <h1>{resumeData.personalInfo.name}</h1>

            <p>
              {resumeData.personalInfo.email} · {resumeData.personalInfo.phone} · {resumeData.personalInfo.location}
            </p>

            <p>
              {resumeData.personalInfo.linkedin} · {resumeData.personalInfo.portfolio}
            </p>
          </header>

          <ResumeSection title="Professional Summary">
            <p>{resumeData.summary}</p>
          </ResumeSection>

          <ResumeSection title="Education">
            {resumeData.education.map((item, index) => (
              <div className="resume-item" key={index}>
                <div className="resume-item-top">
                  <strong>{item.institution}</strong>
                  <span>{item.startDate} - {item.endDate}</span>
                </div>

                <p>
                  {item.degree} · GPA {item.gpa}
                </p>
              </div>
            ))}
          </ResumeSection>

          <ResumeSection title="Experience">
            {resumeData.experience.map((item, index) => (
              <div className="resume-item" key={index}>
                <div className="resume-item-top">
                  <strong>
                    {item.company} · {item.role}
                  </strong>

                  <span>{item.startDate} - {item.endDate}</span>
                </div>

                <ul>
                  {item.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </ResumeSection>

          <ResumeSection title="Projects">
            {resumeData.projects.map((item, index) => (
              <div className="resume-item" key={index}>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
                <small>{item.link}</small>
              </div>
            ))}
          </ResumeSection>

          <ResumeSection title="Skills">
            <p>
              {resumeData.skills.technical.join(" · ")}
            </p>
          </ResumeSection>

          <ResumeSection title="Certifications">
            <p>
              {resumeData.certifications.map(c => `${c.name} (${c.issuer})`).join(" · ")}
            </p>
          </ResumeSection>
        </article>
      </section>
    </>
  );
}

function ResumeSection({ title, children }) {
  return (
    <section className="resume-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
