import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { authApi } from "../api/index.js";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem("resumeRoastToken", data.token);
      localStorage.setItem("resumeRoastAuth", "true");
      localStorage.setItem("resumeRoastUser", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form">
        <div className="mobile-logo">
          ResumeRoast <span style={{ color: "var(--primary)" }}>AI</span>
        </div>

        <div className="form-heading">
          <h2>Welcome back</h2>
          <p>Sign in to continue to your resume workspace.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-label">
              <label>Password</label>
              <button type="button" className="forgot-link">Forgot password?</button>
            </div>
            <div className="password-input">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
