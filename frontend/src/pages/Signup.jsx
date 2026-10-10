import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { authApi } from "../api/index.js";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.signup({
        name,
        email,
        password,
      });

      if (data.token) {
        localStorage.setItem("resumeRoastToken", data.token);
      }

      localStorage.setItem("resumeRoastAuth", "true");

      if (data.user) {
        localStorage.setItem(
          "resumeRoastUser",
          JSON.stringify(data.user)
        );
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to create account.");
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
          <h2>Create your account</h2>
          <p>Start improving your resume in a few minutes.</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Anmol Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label>Password</label>
            <div className="password-input">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
