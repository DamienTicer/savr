import React, { useState } from "react";
import "./AuthPages.css"; //Import shared aesthetics css

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const response = await fetch("http://localhost:3001/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      alert("User registered successfully.");
    } else {
      alert("Registration failed.");
    }
  };

  // Define the goToHomePage function
  const goToHomePage = () => {
    window.location.href = "/"; // Redirect to the home page
  };

  return (
    <div className="container">
      <h1>Register</h1>
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
        <button type="button" onClick={handleRegister}>
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;