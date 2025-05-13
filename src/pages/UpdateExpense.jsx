import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import styles from "../styles/UpdateExpense.module.css";
import BackButton from "../components/backbutton";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const UpdateExpense = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = await getToken();
        const res = await axios.get("http://localhost:8000/expenses/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExpenses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.message || "Failed to fetch expenses.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [getToken]);

  const handleSelect = (id) => {
    setSelectedId(id);
    const selected = expenses.find((e) => e.id === id);
    setEditValues({ ...selected });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = await getToken();
      const res = await axios.put(
        `http://localhost:8000/expenses/${selectedId}`,
        editValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const updated = res.data;
      setExpenses(expenses.map((e) => (e.id === selectedId ? updated : e)));
      setSelectedId(null);
    } catch (err) {
      alert("Error updating expense: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className="back"><BackButton /></div>
      <h1 className={styles.title}>Update Expenses</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : (
        <table className={styles.expenseTable}>
          <thead>
            <tr>
              <th>Select</th>
              <th>Category</th>
              <th>Amount (₹)</th>
              <th>Date</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>
                  <input
                    type="radio"
                    checked={selectedId === expense.id}
                    onChange={() => handleSelect(expense.id)}
                  />
                </td>
                {selectedId === expense.id ? (
                  <>
                    <td>
                      <input
                        name="category"
                        value={editValues.category}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        name="amount"
                        type="number"
                        value={editValues.amount}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        name="date"
                        type="date"
                        value={editValues.date?.slice(0, 10)}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        name="description"
                        value={editValues.description}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <button onClick={handleSave}>Save</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{expense.category}</td>
                    <td>{expense.amount}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>—</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => navigate("/predict")}>Go to Prediction</button>
    </div>
  );
};

export default UpdateExpense;
