// src/components/DeleteExpenseButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/DeleteExpenseButton.module.css";

const DeleteExpenseButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/delete-expense"); // your route for the delete screen
  };

  return (
    <button className={styles.deleteBtn} onClick={handleClick}>
      Delete Expenses
    </button>
  );
};

export default DeleteExpenseButton;
