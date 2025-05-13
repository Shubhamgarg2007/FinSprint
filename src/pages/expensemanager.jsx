import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseChart from "../components/ExpenseChart";
import styles from "../styles/ExpenseManager.module.css";
import BackButton from "../components/backbutton";
import { useAuth } from "@clerk/clerk-react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const ExpenseManager = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/sign-in");
    }
  }, [isSignedIn, navigate]);

  const handleGenerateSummary = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${baseUrl}/expensesummary/generate_expense_summary/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      alert("Expense Summary:\n" + JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Summary generation failed:", error);
      alert("Failed to generate summary.");
    }
  };

  return (
    <>
      <div className="back"><BackButton /></div>
      <div className={styles.container}>
        <h1 className={styles.title}>Expense Tracker</h1>
        <div className={styles.buttonContainer}>
          <button className="button-64" onClick={() => navigate("/add-expense")}>
            <span className="text">Add Expense</span>
          </button>
          <button className="button-64" onClick={() => navigate("/get-expense")}>
            <span className="text">View All Expenses</span>
          </button>
          <button className="button-64" onClick={() => navigate("/update-expense")}>
            <span className="text">Update Expenses</span>
          </button>
          <button className="button-64" onClick={() => navigate("/delete-expense")}>
            <span className="text">Delete Expense</span>
          </button>
          <button className="button-64" onClick={handleGenerateSummary}>
            <span className="text">Generate Summary</span>
          </button>
          <button className="button-64" onClick={() => navigate("/predict")}>
            <span className="text">Predict</span>
          </button>
        </div>
        <div className={styles.chartContainer}>
          <ExpenseChart />
        </div>
      </div>
    </>
  );
};

export default ExpenseManager;
