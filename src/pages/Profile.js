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
    tuition: true
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
          tuition: true
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();
  }, []);

  // Logout handler
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      navigate("/login");
    }
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

    const [originalPassword, setOriginalPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordChangeMessage, setPasswordChangeMessage] = useState("");

    const handleChangePassword = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch("http://localhost:3001/change-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ originalPassword, newPassword }),
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to change password.");
          }
      
          const data = await response.json();
          setUserData((prev) => ({ ...prev, passwordLength: data.passwordLength }));
          setPasswordChangeMessage("Password updated successfully.");
          setOriginalPassword("");
          setNewPassword("");
        } catch (err) {
          setPasswordChangeMessage(err.message);
        }
    };      

    const [originalEmail, setOriginalEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [emailChangeMessage, setEmailChangeMessage] = useState("");
    
    const handleChangeEmail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3001/change-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ originalEmail, newEmail }),
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to change email.");
        }
    
        setUserData((prev) => ({ ...prev, email: newEmail }));
        setEmailChangeMessage("Email updated successfully.");
        setOriginalEmail("");
        setNewEmail("");
      } catch (err) {
        setEmailChangeMessage(err.message);
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
  
      alert("Preferences saved successfully.");
    } catch (err) {
      console.error("Error saving preferences:", err.message);
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
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      <div className="profile">
        {/* User Info Section */}
        <div className="user-info-box">
        <h2>Profile</h2>
        <p>User ID: {userData.userId || "Not Available"}</p>
        <p>Email: {userData.email || "Not Available"}</p>
        <p>Password: {userData.passwordLength ? "*".repeat(userData.passwordLength) : "Not Available"}</p>
        <div className="profile-buttons">
            <button onClick={handleLogout} style={{backgroundColor: "#f44336"}}>Log Out</button>
            <button onClick={handleDeleteAccount} style={{backgroundColor: "#f44336"}}>Delete Account</button>
        </div>
        </div>

        {/* Preferences Section */}
        <div className="preferences-box">
        <h3>Preferences</h3>
        <div className="preference-item">
          <label>Tuition Tracking:</label>
          <select
            value={preferences.tuition ? "active" : "inactive"}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                tuition: e.target.value === "active",
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="preference-item">
          <label>Savings Goals:</label>
          <select
            value={preferences.savings_goals ? "active" : "inactive"}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                savings_goals: e.target.value === "active",
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="preference-item">
          <label>Income Sources:</label>
          <select
            value={preferences.income_sources ? "active" : "inactive"}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                income_sources: e.target.value === "active",
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="preference-item">
          <label>Expenses:</label>
          <select
            value={preferences.expenses ? "active" : "inactive"}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                expenses: e.target.value === "active",
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="preference-item">
          <label>Loans:</label>
          <select
            value={preferences.loans ? "active" : "inactive"}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                loans: e.target.value === "active",
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button onClick={handleSavePreferences}>Save Preferences</button>
      </div>
      </div>

        {/* Update Login Info Section */}
      <div className="update-sections">
        <div className="change-email">
            <h2>Change Email</h2>
            <input
            type="email"
            placeholder="Original Email"
            value={originalEmail}
            onChange={(e) => setOriginalEmail(e.target.value)}
            />
            <input
            type="email"
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            />
            <button className="update-button" onClick={handleChangeEmail}>
            Update Email
            </button>
            {emailChangeMessage && <p>{emailChangeMessage}</p>}
        </div>

        <div className="change-password">
            <h2>Change Password</h2>
            <input
            type="password"
            placeholder="Original Password"
            value={originalPassword}
            onChange={(e) => setOriginalPassword(e.target.value)}
            />
            <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="update-button" onClick={handleChangePassword}>
            Update Password
            </button>
            {passwordChangeMessage && <p>{passwordChangeMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default Profile;