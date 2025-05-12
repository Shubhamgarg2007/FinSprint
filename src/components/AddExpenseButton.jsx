import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AddExpenseButton.module.css";

const AddExpenseButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/add-expense");
  };

  return (
    <button onClick={handleClick} className={styles.addExpenseButton}>
      Add Expense
    </button>
  );
};

export default AddExpenseButton;

