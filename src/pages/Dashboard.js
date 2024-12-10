import React, { useEffect, useState } from "react";

/**
 * Dashboard Component
 * Displays and updates user profile data including savings goals, income sources, and expenses in a tabular format with scrollable tables.
 */
function Dashboard() {
  const [profile, setProfile] = useState(null); // Holds profile data
  const [error, setError] = useState(null); // Holds error messages, if any
  const [newSavingsGoal, setNewSavingsGoal] = useState({ targetAmount: "", deadline: "" });
  const [newIncomeSource, setNewIncomeSource] = useState({ source: "", amount: "", frequency: "" });
  const [newExpense, setNewExpense] = useState({ category: "", amount: "", date: "", notes: "" });
  const [loans, setLoans] = useState([]); // State for loans
  const [newLoan, setNewLoan] = useState({ originalDebt: "", currentDebt: "", interestRate: "" });

  // Fetch user profile data from the backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage

        const response = await fetch("http://localhost:3001/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data); // Set profile data
      } catch (err) {
        setError(err.message); // Set error message
      }
    };

    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3001/loans", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch loans.");
        }

        const data = await response.json();
        setLoans(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchProfile();
    fetchLoans();

  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    window.location.href = "/login"; // Redirect to the login page
  };

  // Handle adding a new savings goal
  const handleAddSavingsGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/savings-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSavingsGoal),
      });

      if (!response.ok) {
        throw new Error("Failed to add savings goal.");
      }

      const addedGoal = await response.json();
      setProfile((prev) => ({
        ...prev,
        savingsGoals: [...prev.savingsGoals, addedGoal],
      }));
      setNewSavingsGoal({ targetAmount: "", deadline: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle removing a savings goal
  const handleRemoveSavingsGoal = async (id) => {
    // Show a confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to remove this entry?");
  
    if (!confirmDelete) {
      // If the user cancels, do nothing
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/savings-goals/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to remove savings goal.");
      }
  
      // Update state to remove the deleted goal
      setProfile((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.filter((goal) => goal.id !== id),
      }));
  
    } catch (err) {
      alert(err.message);
    }
  };
  

  // Handle adding a new income source
  const handleAddIncomeSource = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/income-sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newIncomeSource),
      });

      if (!response.ok) {
        throw new Error("Failed to add income source.");
      }

      const data = await response.json(); //get the new goal with its ID
      setProfile((prev) => ({
        ...prev,
        incomeSources: [...prev.incomeSources, newIncomeSource],
      }));
      setNewIncomeSource({ source: "", amount: "", frequency: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle removing an income source
  const handleRemoveIncomeSource = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this entry?");
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/income-sources/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to remove income source.");
      }
  
      setProfile((prev) => ({
        ...prev,
        incomeSources: prev.incomeSources.filter((source) => source.id !== id),
      }));
  
    } catch (err) {
      alert(err.message);
    }
  };
  

  // Handle adding a new expense
  const handleAddExpense = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error("Failed to add expense.");
      }

      const data = await response.json(); //get the new goal with its ID
      setProfile((prev) => ({
        ...prev,
        expenses: [...prev.expenses, newExpense],
      }));
      setNewExpense({ category: "", amount: "", date: "", notes: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle removing an expense
  const handleRemoveExpense = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this entry?");
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to remove expense.");
      }
  
      setProfile((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((expense) => expense.id !== id),
      }));

    } catch (err) {
      alert(err.message);
    }
  };  

  const handleAddLoan = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLoan),
      });

      if (!response.ok) {
        throw new Error("Failed to add loan.");
      }

      const addedLoan = await response.json();
      setLoans((prev) => [...prev, addedLoan]);
      setNewLoan({ originalDebt: "", currentDebt: "", interestRate: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveLoan = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this loan?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/loans/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete loan.");
      }

      setLoans((prev) => prev.filter((loan) => loan.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Render error message if an error occurs
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Render loading indicator if profile data is not yet loaded
  if (!profile) {
    return <div className="loading">Loading...</div>;
  }

  // Helper function to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Render profile data in styled and scrollable tables
  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
      </header>

      <div className="profile-section">
        <h2>User ID: {profile.userId}</h2>
        <button onClick={handleLogout} style={{ marginLeft: "auto", padding: "10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}}>
          Logout
        </button>
        {/* Savings Goals Section */}
        <div className="savings-goals">
          <h3>Savings Goals</h3>
          {profile.savingsGoals.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", tableLayout: "auto" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Target Amount</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Deadline</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.savingsGoals.map((goal) => (
                    <tr key={goal.id}>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{goal.target_amount}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{formatDate(goal.deadline)}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>
                        <button onClick={() => handleRemoveSavingsGoal(goal.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No savings goals found.</p>
          )}
          <div className="add-savings-goal">
            <h4>Add Savings Goal</h4>
            <input
              type="number"
              placeholder="Target Amount"
              value={newSavingsGoal.targetAmount}
              onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, targetAmount: e.target.value })}
            />
            <input
              type="date"
              placeholder="Deadline"
              value={newSavingsGoal.deadline}
              onChange={(e) => setNewSavingsGoal({ ...newSavingsGoal, deadline: e.target.value })}
            />
            <button onClick={handleAddSavingsGoal}>Add</button>
          </div>
        </div>

        {/* Income Sources Section */}
        <div className="income-sources">
          <h3>Income Sources</h3>
          {profile.incomeSources.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", tableLayout: "auto" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid black", padding: "8px" }}>Source</th>
                      <th style={{ border: "1px solid black", padding: "8px" }}>Amount</th>
                      <th style={{ border: "1px solid black", padding: "8px" }}>frequency</th>
                      <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.incomeSources.map((source) => (
                      <tr key={source.id}>
                        <td style={{ border: "1px solid black", padding: "8px" }}>{source.source}</td>
                        <td style={{ border: "1px solid black", padding: "8px" }}>{source.amount}</td>
                        <td style={{ border: "1px solid black", padding: "8px" }}>{source.frequency}</td>
                        <td style={{ border: "1px solid black", padding: "8px" }}>
                          <button onClick={() => handleRemoveIncomeSource(source.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          ) : (
            <p>No income sources found.</p>
          )}
          <div className="add-income-source">
            <h4>Add Income Source</h4>
            <input
              type="text"
              placeholder="Source"
              value={newIncomeSource.source}
              onChange={(e) => setNewIncomeSource({ ...newIncomeSource, source: e.target.value })}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newIncomeSource.amount}
              onChange={(e) => setNewIncomeSource({ ...newIncomeSource, amount: e.target.value })}
            />
            <input
              type="text"
              placeholder="Frequency"
              value={newIncomeSource.frequency}
              onChange={(e) => setNewIncomeSource({ ...newIncomeSource, frequency: e.target.value })}
            />
            <button onClick={handleAddIncomeSource}>Add</button>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="expenses">
          <h3>Expenses</h3>
          {profile.expenses.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", tableLayout: "auto" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Category</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Amount</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Date</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Notes</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{expense.category}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{expense.amount}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{formatDate(expense.date)}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{expense.notes}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>
                        <button onClick={() => handleRemoveExpense(expense.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No expenses found.</p>
          )}
          <div className="add-expense">
            <h4>Add Expense</h4>
            <input
              type="text"
              placeholder="Category"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />
            <input
              type="date"
              placeholder="Date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            />
            <input
              type="text"
              placeholder="Notes"
              value={newExpense.notes}
              onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
            />
            <button onClick={handleAddExpense}>Add</button>
          </div>
        </div>

        {/* Loans Section */}
        <div className="loans">
          <h3>Loans</h3>
          {loans.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", tableLayout: "auto" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Original Debt</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Current Debt</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Interest Rate (%)</th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{loan.original_debt}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{loan.current_debt}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>{loan.interest_rate}</td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>
                        <button onClick={() => handleRemoveLoan(loan.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No loans found.</p>
          )}
          <div className="add-loan">
            <h4>Add New Loan</h4>
            <input
              type="number"
              placeholder="Original Debt"
              value={newLoan.originalDebt}
              onChange={(e) => setNewLoan({ ...newLoan, originalDebt: e.target.value })}
            />
            <input
              type="number"
              placeholder="Current Debt"
              value={newLoan.currentDebt}
              onChange={(e) => setNewzoan({ ...newLoan, currentDebt: e.target.value })}
            />
            <input
              type="number"
              placeholder="Interest Rate"
              value={newLoan.interestRate}
              onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
            />
            <button onClick={handleAddLoan}>Add Loan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
