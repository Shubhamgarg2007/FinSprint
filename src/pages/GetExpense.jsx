import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import styles from "../styles/GetExpense.module.css";
import BackButton from "../components/backbutton";
// import { fetchExpenses } from "../services/expenseservice";
import Papa from "papaparse";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GetExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState("");
  const { getToken } = useAuth();


  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const exportAsCSV = () => {
    const csv = Papa.unparse(
      expenses.map((e) => ({
        Category: e.category,
        Description: e.description,
        Amount: e.amount,
        Date: formatDate(e.date),
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = () => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add a title
      doc.text("Expense Report", 14, 15);

      // Prepare data for the table
      const tableData = expenses.map((e) => [
        e.category || "Uncategorized",
        e.description || "-",
        `₹${e.amount || 0}`,
        formatDate(e.date),
      ]);

      // Generate the table
      autoTable(doc, {
        head: [["Category", "Description", "Amount", "Date"]],
        body: tableData,
        startY: 20,
        columnStyles: {
          2: { cellWidth: 30 }, // Adjust the width of the "Amount" column (index 2)
        },
      });
      

      // Save the PDF
      doc.save("expenses.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError(`Failed to generate PDF: ${error.message}`);
    }
  };

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed: No token available");

      const response = await axios.get("http://localhost:8000/expenses/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError(`Failed to fetch expenses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [getToken]);

  return (
    <div className={styles.container}>
      <div className="back">
        <BackButton />
      </div>

      <h1 className={styles.title}>All Expenses</h1>

      <div className={styles.controlPanel}>
        <button
          onClick={loadExpenses}
          disabled={loading}
          className={styles.refreshButton || ""}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
        <select
          onChange={(e) => setExportFormat(e.target.value)}
          value={exportFormat}
          className={styles.exportDropdown}
        >
          <option value="" disabled>
            Export as...
          </option>
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </select>

        <button
          onClick={() => {
            if (exportFormat === "csv") exportAsCSV();
            if (exportFormat === "pdf") exportAsPDF();
          }}
          disabled={!exportFormat}
        >
          Export
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage || "error-message"}>{error}</div>
      )}

      {loading ? (
        <div className={styles.loading || "loading"}>Loading expenses...</div>
      ) : (
        <div className={styles.expensesContainer}>
          {expenses.length === 0 ? (
            <div className={styles.noExpenses || "no-expenses"}>
              No expenses found.
            </div>
          ) : (
            <table className={styles.expensesTable || "expenses-table"}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className={styles.expenseRow || "expense-row"}
                  >
                    <td
                      className={styles.expenseCategory || "expense-category"}
                    >
                      {expense.category || "Uncategorized"}
                    </td>
                    <td
                      className={
                        styles.expenseDescription || "expense-description"
                      }
                    >
                      {expense.description || "-"}
                    </td>
                    <td className={styles.expenseAmount || "expense-amount"}>
                      ₹{expense.amount || 0}
                    </td>
                    <td className={styles.expenseDate || "expense-date"}>
                      {formatDate(expense.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default GetExpense;
