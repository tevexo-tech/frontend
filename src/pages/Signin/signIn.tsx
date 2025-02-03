import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import "./signIn.css";
import { environment } from "../environment/environment";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const apiUrl = environment.apiUrl;

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const loginData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Login successful:", result);

        localStorage.setItem("jwt_token", result.token);
        localStorage.setItem("user_email", result.user.email);

        navigate("/todo");
      } else {
        // If login fails, set the error message in state
        setErrorMessage(
          result.message || "Unknown error occurred during login."
        );
        console.error("Login failed:", result.message || "Unknown error");
      }
    } catch (error) {
      setErrorMessage(
        "An error occurred while logging in. Please try again later."
      );
      console.error("Error occurred while logging in:", error);
    }
  };

  const handleInputChange = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <h2 className="signin-title">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="signin-input"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={handleInputChange}
          />
          <input
            type="password"
            placeholder="Password"
            className="signin-input"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handleInputChange}
          />
          <button type="submit" className="signin-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
