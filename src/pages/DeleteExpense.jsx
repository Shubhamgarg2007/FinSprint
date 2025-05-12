import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import styles from "../styles/DeleteExpense.module.css";
import BackButton from "../components/backbutton";

const DeleteExpense = () => {
  const { getToken } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = await getToken();
        const res = await axios.get("http://localhost:8000/expenses/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExpenses(res.data);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      }
    };

    fetchExpenses();
  }, [getToken]);

  // Handle individual selection
  const handleSelect = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((existingId) => existingId !== id)
        : [...prevSelected, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]); // unselect all
    } else {
      setSelectedIds(expenses.map((e) => e.id)); // select all
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one expense to delete.");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      // Delete all selected expenses in parallel
      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`http://localhost:8000/expenses/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      // Update UI after deletion
      setExpenses((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
      setSelectedIds([]);
      alert("Selected expenses deleted.");
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete expenses: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.container}>
      <div className="back">
        <BackButton />
      </div>

      <h1>Delete Expenses</h1>

      {expenses.length === 0 ? (
        <p>No expenses to delete.</p>
      ) : (
        <form className={styles.form}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === expenses.length}
                    onChange={handleSelectAll}
                  />
                </th>
                {/* <th>ID</th> */}
                <th>Date</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(expense.id)}
                      onChange={() => handleSelect(expense.id)}
                    />
                  </td>
                  {/* <td>{expense.id}</td> */}
                  <td>{expense.date?.slice(0, 10)}</td>
                  <td>{expense.description}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.category}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || selectedIds.length === 0}
            className={styles.deleteBtn}
          >
            {loading ? "Deleting..." : "Delete Selected"}
          </button>
        </form>
      )}
    </div>
  );
};

export default DeleteExpense;
