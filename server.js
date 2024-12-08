require("dotenv").config();
const mysql = require("mysql2/promise");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

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
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
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
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword]);
    res.status(201).send("User registered successfully.");
  } catch (err) {
    res.status(400).send(err.message);
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

    const [savingsGoals] = await pool.query("SELECT * FROM savings_goals WHERE user_id = ?", [userId]);
    const [incomeSources] = await pool.query("SELECT * FROM income_sources WHERE user_id = ?", [userId]);
    const [expenses] = await pool.query("SELECT * FROM expenses WHERE user_id = ?", [userId]);

    res.json({ userId, savingsGoals, incomeSources, expenses });
  } catch (err) {
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