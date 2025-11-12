import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signIn.css";
import { environment } from "../environment/environment";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const apiUrl = environment.apiUrl;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${apiUrl}/app/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("user_email", data.user.email);
        navigate("/todo");
      } else {
        setErrorMessage(data.message || "Login failed. Try again.");
      }
    } catch {
      setErrorMessage("Unable to connect. Please try again later.");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <h2 className="signin-title">𝒍𝒐𝒈𝒊𝒏</h2>
        <p className="signin-subtitle">
          Sign In with your mail
        </p>

        <form onSubmit={handleSubmit} className="signin-form">
          <input
            type="email"
            placeholder="Enter your email address"
            className="signin-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="signin-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="signin-button">
            Log in
          </button>
        </form>

        <div className="signin-footer">
          Don’t have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
