import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPages.css"; //Import shared aesthetics css

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); // Store token
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      alert(error.message);
    }
  };

  // Define the goToHomePage function
  const goToHomePage = () => {
    window.location.href = "/"; // Redirect to the home page
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <h2><button
        onClick={goToHomePage}
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#000000",
          color: "yellow",
          border: "solid #FFFF00",
          borderRadius: "5px",
          cursor: "pointer",
        }}>
        Go to Home Page
      </button></h2>
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleLogin}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
