import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    userId: "",
    email: "",
    passwordLength: 0, // Store password length
  });
  const [preferences, setPreferences] = useState({
    savingsGoals: true,
    incomeSources: true,
    expenses: true,
    loans: true,
  });
  const [error, setError] = useState(null);

  // Fetch user data and preferences
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3001/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const data = await response.json();
        setUserData(data.user || { userId: "", email: "", passwordLength: 0 });
        setPreferences(data.preferences || {
          savingsGoals: true,
          incomeSources: true,
          expenses: true,
          loans: true,
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/delete-account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account.");
      }

      alert("Account deleted successfully.");
      handleLogout();
    } catch (err) {
      alert(err.message);
    }
  };

  // Toggle preferences
  const handlePreferencesChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Save preferences handler
  const handleSavePreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences.");
      }

      alert("Preferences updated successfully.");
    } catch (err) {
      alert(err.message);
    }
  };

  // Render error if fetching fails
  if (error) {
    return (
      <div className="profile-container">
        <h1>User Profile</h1>
        <p>Error: {error}</p>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <p>User ID: {userData.userId || "Not Available"}</p>
      <p>Email: {userData.email || "Not Available"}</p>
      <p>Password: {userData.passwordLength ? "*".repeat(userData.passwordLength) : "Not Available"}</p>
      <div className="profile-buttons">
        <button onClick={handleLogout} style={{backgroundColor: "#f44336"}}>Log Out</button>
        <button onClick={handleDeleteAccount} style={{backgroundColor: "#f44336"}}>Delete Account</button>
      </div>

      <h2>Preferences</h2>
      <div className="preferences">
        <label>
          <input
            type="checkbox"
            checked={preferences.savingsGoals}
            onChange={() => handlePreferencesChange("savingsGoals")}
          />
          Show Savings Goals
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.incomeSources}
            onChange={() => handlePreferencesChange("incomeSources")}
          />
          Show Income Sources
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.expenses}
            onChange={() => handlePreferencesChange("expenses")}
          />
          Show Expenses
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.loans}
            onChange={() => handlePreferencesChange("loans")}
          />
          Show Loans
        </label>
      </div>
      <button onClick={handleSavePreferences}>Save Preferences</button>
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
}

export default Profile;