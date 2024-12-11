import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the CSS file for aesthetic changes


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
  const [preferences, setPreferences] = useState({
    savingsGoals: true,
    incomeSources: true,
    expenses: true,
    loans: true,
  });

  const navigate = useNavigate();

  // Helper function for formatted dates
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // Fetch user profile data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch profile data
        const profileResponse = await fetch("http://localhost:3001/dashboard", { headers });
        if (!profileResponse.ok) throw new Error("Failed to fetch profile data.");
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch loans data
        const loansResponse = await fetch("http://localhost:3001/loans", { headers });
        if (!loansResponse.ok) throw new Error("Failed to fetch loans data.");
        const loansData = await loansResponse.json();
        setLoans(loansData);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3001/preferences", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch preferences.");
        }
  
        const data = await response.json();
        setPreferences({
          savingsGoals: data.savings_goals,
          incomeSources: data.income_sources,
          expenses: data.expenses,
          loans: data.loans,
        });
      } catch (err) {
        console.error("Error fetching preferences:", err.message);
      }
    };
  
    fetchPreferences();
    fetchData();
  }, []);

  if (!profile) return <div>Loading...</div>;

  // API helpers for add/remove actions
  const apiCall = async (url, method, body = null) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : null,
      });
      if (!response.ok) throw new Error("API call failed");
      return await response.json();
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

    // Add Handlers
    const handleAddSavingsGoal = async () => {
      const addedGoal = await apiCall("http://localhost:3001/savings-goals", "POST", newSavingsGoal);
      if (addedGoal) {
        setProfile((prev) => ({
          ...prev,
          savingsGoals: [...prev.savingsGoals, addedGoal],
        }));
        setNewSavingsGoal({ targetAmount: "", deadline: "" });
      }
    };
  
    const handleAddIncomeSource = async () => {
      const addedSource = await apiCall("http://localhost:3001/income-sources", "POST", newIncomeSource);
      if (addedSource) {
        setProfile((prev) => ({
          ...prev,
          incomeSources: [...prev.incomeSources, addedSource],
        }));
        setNewIncomeSource({ source: "", amount: "", frequency: "" });
      }
    };
  
    const handleAddExpense = async () => {
      const addedExpense = await apiCall("http://localhost:3001/expenses", "POST", newExpense);
      if (addedExpense) {
        setProfile((prev) => ({
          ...prev,
          expenses: [...prev.expenses, addedExpense],
        }));
        setNewExpense({ category: "", amount: "", date: "", notes: "" });
      }
    };
  
    const handleAddLoan = async () => {
      const addedLoan = await apiCall("http://localhost:3001/loans", "POST", newLoan);
      if (addedLoan) {
        setLoans((prev) => [...prev, addedLoan]);
        setNewLoan({ originalDebt: "", currentDebt: "", interestRate: "" });
      }
    };
  
    // Remove Handlers
    const handleRemove = async (id, type) => {
      const confirmDelete = window.confirm("Are you sure you want to remove this entry?");
      if (!confirmDelete) return;
  
      const endpoint = `http://localhost:3001/${type}/${id}`;
      const removed = await apiCall(endpoint, "DELETE");
      if (removed) {
        setProfile((prev) => ({
          ...prev,
          [type]: prev[type].filter((item) => item.id !== id),
        }));
      }
    };
  
    if (error) return <div>Error: {error}</div>;
    if (!profile) return <div>Loading...</div>;

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

  // Render profile data in styled and scrollable tables
  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
      </header>
      <div className="profile-section">
        <div className="child">
          <button onClick={() => navigate("/profile")}>Go to Profile</button>
        </div>

        <div className="dashboard-grid">
          {/* Savings Goals Section */}
          <div className={`savings-goals ${!preferences.savingsGoals ? "hidden" : ""}`}>
          {preferences.savingsGoals && (
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
          )}
          </div>

          {/* Income Sources Section */}
          <div className={`income-sources ${!preferences.incomeSources ? "hidden" : ""}`}>
          {preferences.incomeSources && (
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
          )}
          </div>

          {/* Expenses Section */}
          <div className={`expenses ${!preferences.expenses ? "hidden" : ""}`}>
          {preferences.expenses && (
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
          )}
          </div>

          {/* Loans Section */}
          <div className={`loans ${!preferences.loans ? "hidden" : ""}`}>
          {preferences.loans && (
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
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
