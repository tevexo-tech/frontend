import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signUp.css";
import { environment } from "../environment/environment";

const SignUp: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = environment.apiUrl;
  const navigate = useNavigate();

  const validate = () => {
    if (!username.trim()) return "Username is required.";
    if (!email.trim()) return "Email is required.";
    // simple email check
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const err = validate();
    if (err) {
      setErrorMessage(err);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/app/v1/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await res.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}

      if (res.ok) {
        setSuccessMessage(json?.message || "Account created successfully.");
        // optional: automatically navigate to login after short delay
        setTimeout(() => navigate("/login"), 1400);
      } else {
        const msg = (json && (json.message || json.error)) || text || `Signup failed (${res.status})`;
        setErrorMessage(msg);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error — please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Create account</h2>
        <p className="signup-subtitle">Create your account to get started.</p>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="field-label">Username</label>
          <input
            className="signup-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            required
            autoComplete="username"
          />

          <label className="field-label">Email</label>
          <input
            className="signup-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <label className="field-label">Password</label>
          <input
            className="signup-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
          />

          <label className="field-label">Confirm Password</label>
          <input
            className="signup-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
          />

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="signup-footer">
          Already have an account?{" "}
          <a href="/" className="signup-link">Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

