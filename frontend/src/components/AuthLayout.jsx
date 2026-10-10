import { FileText, Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand-icon">
            <FileText size={23} />
          </div>
          <div>
            <div className="brand-name">
              ResumeRoast <span>AI</span>
            </div>
            <div className="brand-subtitle">Resume intelligence</div>
          </div>
        </div>

        <div className="auth-hero">
          <div className="small-badge">
            <Sparkles size={15} />
            AI-powered resume optimization
          </div>

          <h1>
            Build a resume
            <br />
            that gets <span>noticed.</span>
          </h1>

          <p>
            Analyze your resume, find what's holding you back, and turn weak
            bullet points into stronger ones.
          </p>

          <div className="auth-points">
            <div>
              <ShieldCheck size={18} />
              <span>ATS-focused analysis</span>
            </div>
            <div>
              <Zap size={18} />
              <span>Instant, actionable feedback</span>
            </div>
            <div>
              <FileText size={18} />
              <span>Professional resume builder</span>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          © 2026 ResumeRoast AI
        </div>
      </div>

      <div className="auth-form-panel">
        {children}
      </div>
    </div>
  );
}