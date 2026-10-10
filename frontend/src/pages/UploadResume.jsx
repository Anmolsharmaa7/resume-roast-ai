import { CheckCircle2, FileText, UploadCloud, Target } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumeApi } from "../api/index.js";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file || !jobDescription.trim()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("targetJobDescription", jobDescription);

      const data = await resumeApi.upload(formData);

      // Navigate to analysis with the new resume ID
      navigate(`/analysis?id=${data.resume.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">NEW ANALYSIS</span>
          <h1>Analyze your resume</h1>
          <p>
            Compare your resume with the job you want and find the gaps.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="upload-grid">
          <section className="content-card upload-card">
            <div className="card-header">
              <div>
                <span className="step-label">STEP 01</span>
                <h2>Upload your resume</h2>
                <p>PDF or DOCX · maximum 5 MB</p>
              </div>

              <FileText size={20} />
            </div>

            <label className="drop-area">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
              />

              <div className="drop-icon">
                <UploadCloud size={25} />
              </div>

              {file ? (
                <>
                  <strong>{file.name}</strong>
                  <span>Ready to analyze</span>
                </>
              ) : (
                <>
                  <strong>Drop your resume here</strong>
                  <span>or click to browse your computer</span>
                </>
              )}
            </label>

            {file && (
              <div className="success-message">
                <CheckCircle2 size={16} />
                Resume selected successfully
              </div>
            )}
          </section>

          <section className="content-card upload-card">
            <div className="card-header">
              <div>
                <span className="step-label">STEP 02</span>
                <h2>Add the target job</h2>
                <p>Paste the complete job description</p>
              </div>

              <div className="small-blue-icon">
                <Target size={17} />
              </div>
            </div>

            <div className="form-field">
              <label>Job description</label>

              <textarea
                value={jobDescription}
                onChange={(e) =>
                  setJobDescription(e.target.value)
                }
                placeholder="Paste the job description here..."
                required
              />

              <span className="field-helper">
                {jobDescription.length} characters · More context gives
                better matching.
              </span>
            </div>
          </section>
        </div>

        {error && <div className="auth-error" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <div className="upload-footer">
          <span>
            Your resume will be analyzed against ATS criteria and the
            target role.
          </span>

          <button
            className="primary-button"
            disabled={!file || !jobDescription.trim() || loading}
          >
            {loading ? "Uploading..." : "Analyze my resume"}
          </button>
        </div>
      </form>
    </>
  );
}
