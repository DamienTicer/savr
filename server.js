require("dotenv").config(); //Ensure environment variables are loaded
const mysql = require("mysql2/promise");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser');

const app = express();

// Middleware Setup
app.use(express.json()); // Parse incoming JSON requests

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from React app
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

// Handle Preflight Requests
app.options("*", cors());

// MySQL Connection Pool Setup
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Database Initialization
const initializeDb = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        target_amount DECIMAL(10, 2) NOT NULL,
        deadline DATE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS income_sources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        source VARCHAR(255),
        amount DECIMAL(10, 2),
        frequency VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(255),
        amount DECIMAL(10, 2),
        date DATE,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    console.log("Database initialized!");
  } catch (err) {
    console.error("Error initializing database:", err.message);
  } finally {
    connection.release();
  }
};
initializeDb().catch(console.error);

// User Registration Endpoint
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  try {
    // Hash the password and get its length
    const hashedPassword = await bcrypt.hash(password, 10);
    const passwordLength = password.length;

    // Insert the user into the database
    const [userResult] = await pool.query(
      "INSERT INTO users (email, password, password_length) VALUES (?, ?, ?)",
      [email, hashedPassword, passwordLength]
    );

    const userId = userResult.insertId; // Get the new user's ID

    // Insert default preferences for the new user
    await pool.query(
      "INSERT INTO preferences (user_id, savings_goals, income_sources, expenses, loans) VALUES (?, ?, ?, ?, ?)",
      [userId, 1, 1, 1, 1]
    );

    res.status(201).send("User registered successfully.");
  } catch (err) {
    console.error("Error in /register route:", err.message);
    res.status(500).send(err.message);
  }
});

// User Login Endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(404).send("User not found.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid credentials.");

    const token = jwt.sign({ userId: user.id }, "secretkey", { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add Savings Goal Endpoint
app.post("/savings-goals", async (req, res) => {
  const { targetAmount, deadline } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    // Insert the new savings goal into the database
    const [result] = await pool.query(
      "INSERT INTO savings_goals (user_id, target_amount, deadline) VALUES (?, ?, ?)",
      [userId, targetAmount, deadline]
    );

    if (result.affectedRows === 1) {
      // Retrieve the newly generated id
      const newId = result.insertId;

      // Send the full goal object back to the frontend
      res.status(201).send({
        id: newId,
        user_id: userId,
        target_amount: targetAmount,
        deadline,
      });
    } else {
      throw new Error("Failed to add savings goal.");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

//add ability to delete an entry in savings goal
app.delete("/savings-goals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM savings_goals WHERE id = ?", [id]);
    res.status(200).send({ message: "Savings goal removed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to remove savings goal." });
  }
});


// Add Income Source Endpoint
app.post("/income-sources", async (req, res) => {
  const { source, amount, frequency } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    // Insert the new income source into the database
    const [result] = await pool.query(
      "INSERT INTO income_sources (user_id, source, amount, frequency) VALUES (?, ?, ?, ?)",
      [userId, source, amount, frequency]
    );

    if (result.affectedRows === 1) {
      const newId = result.insertId; // Get the generated ID

      // Send the full income source object back to the frontend
      res.status(201).send({
        id: newId,
        user_id: userId,
        source,
        amount,
        frequency,
      });
    } else {
      throw new Error("Failed to add income source.");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

//add ability to delete an entry in income sources
app.delete("/income-sources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM income_sources WHERE id = ?", [id]);
    res.status(200).send({ message: "Income source removed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to remove income source." });
  }
});

// Add Expense Endpoint
app.post("/expenses", async (req, res) => {
  const { category, amount, date, notes } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [result] = await pool.query(
      "INSERT INTO expenses (user_id, category, amount, date, notes) VALUES (?, ?, ?, ?, ?)",
      [userId, category, amount, date, notes]
    );

    if (result.affectedRows === 1) {
      const newId = result.insertId; // Get the generated ID

      // Send the full expense object back to the frontend
      res.status(201).send({
        id: newId,
        user_id: userId,
        category,
        amount,
        date,
        notes,
      });
    } else {
      throw new Error("Failed to add expense.");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

//add ability to delete an entry in expenses
app.delete("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM expenses WHERE id = ?", [id]);
    res.status(200).send({ message: "Expense removed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to remove expense." });
  }
});

// Dashboard Data Endpoint
app.get("/dashboard", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    // Fetch user preferences
    const [preferences] = await pool.query("SELECT * FROM preferences WHERE user_id = ?", [userId]);
    const userPreferences = preferences[0];

    if (!userPreferences) {
      return res.status(404).send("Preferences not found.");
    }

    const data = {};
    if (userPreferences.savings_goals) {
      const [savingsGoals] = await pool.query("SELECT * FROM savings_goals WHERE user_id = ?", [userId]);
      data.savingsGoals = savingsGoals;
    }
    if (userPreferences.income_sources) {
      const [incomeSources] = await pool.query("SELECT * FROM income_sources WHERE user_id = ?", [userId]);
      data.incomeSources = incomeSources;
    }
    if (userPreferences.expenses) {
      const [expenses] = await pool.query("SELECT * FROM expenses WHERE user_id = ?", [userId]);
      data.expenses = expenses;
    }
    if (userPreferences.loans) {
      const [loans] = await pool.query("SELECT * FROM loans WHERE user_id = ?", [userId]);
      data.loans = loans;
    }

    // Log the final response
    console.log("Dashboard data:", data);
    res.json(data);
  } catch (err) {
    console.error("Error in /dashboard route:", err.message);
    res.status(500).send(err.message);
  }
});

app.get("/preferences", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [preferences] = await pool.query("SELECT * FROM preferences WHERE user_id = ?", [userId]);

    // If no preferences exist, initialize defaults
    if (preferences.length === 0) {
      await pool.query(
        "INSERT INTO preferences (user_id, savings_goals, income_sources, expenses, loans, tuition) VALUES (?, TRUE, TRUE, TRUE, TRUE, TRUE)",
        [userId]
      );
      return res.json({
        user_id: userId,
        savings_goals: true,
        income_sources: true,
        expenses: true,
        loans: true,
        tuition: true,
      });
    }

    if (preferences.length === 0) {
      return res.status(404).send("Preferences not found.");
    }

    res.json(preferences[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

//fetch user data for profile
app.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    // Check if preferences exist for the user
    const [preferences] = await pool.query("SELECT * FROM preferences WHERE user_id = ?", [userId]);

    if (preferences.length === 0) {
      // Insert default preferences if none exist
      await pool.query(
        "INSERT INTO preferences (user_id, savings_goals, income_sources, expenses, loans) VALUES (?, TRUE, TRUE, TRUE, TRUE)",
        [userId]
      );
    }

    // Fetch updated preferences and user data
    const [user] = await pool.query(
      "SELECT id AS userId, email, password_length AS passwordLength FROM users WHERE id = ?",
      [userId]
    );
    const [updatedPreferences] = await pool.query("SELECT * FROM preferences WHERE user_id = ?", [userId]);

    res.json({ user: user[0], preferences: updatedPreferences[0] });
  } catch (err) {
    console.error("Error in /profile route:", err.message);
    res.status(500).send(err.message);
  }
});

//update preferences
app.post("/preferences", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const { savings_goals, income_sources, expenses, loans, tuition } = req.body;

    // Log the incoming preferences for debugging
    console.log("Saving preferences for user ID:", userId);
    console.log("Preferences received:", req.body);

    const [result] = await pool.query(
      "UPDATE preferences SET savings_goals = ?, income_sources = ?, expenses = ?, loans = ?, tuition = ? WHERE user_id = ?",
      [savings_goals, income_sources, expenses, loans, tuition, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update preferences. User may not exist.");
    }

    res.status(200).send("Preferences updated successfully.");
  } catch (err) {
    console.error("Error in /preferences route:", err.message);
    res.status(500).send(err.message);
  }
});

//Ability to delete your account
app.delete("/delete-account", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    await pool.query("START TRANSACTION");

    // Delete associated data
    await pool.query("DELETE FROM preferences WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM savings_goals WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM loans WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM income_sources WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM expenses WHERE user_id = ?", [userId]);

    // Delete user account
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);

    await pool.query("COMMIT");

    // Clear token and return success
    res.status(200).send("Account deleted successfully. Please log out.");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error in /delete-account route:", err.message);
    res.status(500).send("Failed to delete account.");
  }
});

// Add a New Loan Route
app.post("/loans", async (req, res) => {
  const { originalDebt, currentDebt, interestRate } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [result] = await pool.query(
      "INSERT INTO loans (user_id, original_debt, current_debt, interest_rate) VALUES (?, ?, ?, ?)",
      [userId, originalDebt, currentDebt, interestRate]
    );

    if (result.affectedRows === 1) {
      const newId = result.insertId;
      res.status(201).send({
        id: newId,
        user_id: userId,
        original_debt: originalDebt,
        current_debt: currentDebt,
        interest_rate: interestRate,
      });
    } else {
      throw new Error("Failed to add loan.");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

// Get All Loans for a User
app.get("/loans", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [loans] = await pool.query(
      "SELECT id, original_debt, current_debt, interest_rate FROM loans WHERE user_id = ?",
      [userId]
    );

    res.status(200).send(loans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

// Update a Loan
app.put("/loans/:id", async (req, res) => {
  const { currentDebt } = req.body;
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [result] = await pool.query(
      "UPDATE loans SET current_debt = ? WHERE id = ? AND user_id = ?",
      [currentDebt, id, userId]
    );

    if (result.affectedRows === 1) {
      res.status(200).send("Loan updated successfully.");
    } else {
      res.status(404).send("Loan not found.");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

// Delete a Loan
app.delete("/loans/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [result] = await pool.query(
      "DELETE FROM loans WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 1) {
      res.status(200).send("Loan deleted successfully.");
    } else {
      res.status(404).send("Loan not found.");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

app.get("/tuition", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [results] = await pool.query(
      "SELECT * FROM tuition_entries WHERE user_id = ?",
      [userId]
    );

    res.json(results);
  } catch (err) {
    console.error("Error in /tuition route:", err.message);
    res.status(500).send("Failed to fetch tuition data.");
  }
});

app.post("/tuition", async (req, res) => {
  const { type, source, amount } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  if (!type || !source || !amount) {
    return res.status(400).send("Missing required fields.");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [result] = await pool.query(
      "INSERT INTO tuition_entries (user_id, type, source, amount) VALUES (?, ?, ?, ?)",
      [userId, type, source, amount]
    );

    if (result.affectedRows === 1) {
      res.status(201).json({
        id: result.insertId,
        type,
        source,
        amount,
      });
    } else {
      throw new Error("Failed to add tuition entry.");
    }
  } catch (err) {
    console.error("Error in /tuition POST route:", err.message);
    res.status(500).send(err.message);
  }
});

app.delete("/tuition/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    const [result] = await pool.query(
      "DELETE FROM tuition_entries WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 1) {
      res.status(200).send("Entry deleted successfully.");
    } else {
      throw new Error("Failed to delete entry or entry not found.");
    }
  } catch (err) {
    console.error("Error in /tuition DELETE route:", err.message);
    res.status(500).send(err.message);
  }
});

// Verify original password and update to new password
app.post("/change-password", async (req, res) => {
  const { originalPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    // Get the hashed password for the user
    const [users] = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(404).send("User not found.");
    }

    const hashedPassword = users[0].password;

    // Verify original password
    const isMatch = await bcrypt.compare(originalPassword, hashedPassword);
    if (!isMatch) {
      return res.status(401).send("Original password is incorrect.");
    }

    // Hash the new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const newPasswordLength = newPassword.length;

    // Update the password and its length
    await pool.query(
      "UPDATE users SET password = ?, password_length = ? WHERE id = ?",
      [newHashedPassword, newPasswordLength, userId]
    );

    // Send the new password length back
    res.json({ passwordLength: newPasswordLength });
  } catch (err) {
    console.error("Error in /change-password route:", err.message);
    res.status(500).send(err.message);
  }
});


app.post("/change-email", async (req, res) => {
  const { originalEmail, newEmail } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    // Verify the original email
    const [users] = await pool.query("SELECT email FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(404).send("User not found.");
    }

    if (users[0].email !== originalEmail) {
      return res.status(401).send("Original email is incorrect.");
    }

    // Check if the new email already exists
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [newEmail]);
    if (existingUser.length > 0) {
      return res.status(400).send("Email is already in use.");
    }

    // Update the email
    const [result] = await pool.query("UPDATE users SET email = ? WHERE id = ?", [newEmail, userId]);

    if (result.affectedRows === 1) {
      res.send("Email updated successfully.");
    } else {
      throw new Error("Failed to update email.");
    }
  } catch (err) {
    console.error("Error in /change-email route:", err.message);
    res.status(500).send(err.message);
  }
});

// Serve Static React Frontend
app.use(express.static(path.join(__dirname, "frontend/build")));

// Catch-All Route for React Frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build/index.html"));
});

// Start the Server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));