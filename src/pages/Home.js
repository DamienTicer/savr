// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";
import "./AuthPages.css"; // Use the same CSS as Login and Register

function Home() {
  return (
    <div className="container">
      <h1 className="home-title">SAVR</h1>
      <div className="home-box">
        <Link to="/register" className="link-button">
          Register
        </Link>
        <Link to="/login" className="link-button">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Home;
