import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseChart from "../components/ExpenseChart";
import styles from "../styles/ExpenseManager.module.css";
import BackButton from "../components/backbutton";
import { useAuth } from "@clerk/clerk-react";

const ExpenseManager = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/sign-in");
    }
  }, [isSignedIn, navigate]);

  const handleGetExpenses = () => {
    navigate("/get-expense");
  };

  const handleUpdateExpenses = () => {
    navigate("/update-expense");
  };

  return (
    <>
      <div className="back">
        <BackButton />
      </div>
      <div className={styles.container}>
        <h1 className={styles.title}>Expense Tracker</h1>
        
        {/* Buttons in horizontal row */}
        <div className={styles.buttonContainer}>
          <button className="button-64" onClick={() => navigate("/add-expense")}>
            <span className="text">Add Expense</span>
          </button>
          <button className="button-64" onClick={handleGetExpenses}>
            <span className="text">View All Expenses</span>
          </button>
          <button className="button-64" onClick={handleUpdateExpenses}>
            <span className="text">Update Expenses</span>
          </button>
          <button className="button-64" onClick={() => navigate("/delete-expense")}>
            <span className="text">Delete Expense</span>
          </button>
        </div>
        
        {/* Chart below buttons */}
        <div className={styles.chartContainer}>
          <ExpenseChart />
        </div>
      </div>
    </>
  );
};

export default ExpenseManager;
