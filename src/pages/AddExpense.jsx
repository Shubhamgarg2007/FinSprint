// import React, { useState } from "react";
// import { useUser, useAuth } from "@clerk/clerk-react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import styles from "../styles/AddExpense.module.css";
// import BackButton from "../components/backbutton";

// const AddExpense = () => {
//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const navigate = useNavigate();

//   const [expenses, setExpenses] = useState([]);
//   const [description, setDescription] = useState("");
//   const [amount, setAmount] = useState("");
//   const [category, setCategory] = useState("Food");
//   const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     const authToken = await getToken();
//     if (!authToken) return;
  
//     const newExpense = {
//       description,
//       amount: parseFloat(amount),
//       category,
//       date,
//     };
  
//     try {
//       const res = await axios.post("http://localhost:8000/expenses/", newExpense, {
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       });

//       setExpenses((prev) => [...prev, res.data]);
//       alert("Expense added successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add expense.");
//     }
//   };

//   const handleFileUpload = async () => {
//     const authToken = await getToken();
//     if (!file || !authToken) return;

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await axios.post("http://localhost:8000/receiptscanner/scan_receipt/", formData, {
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       const data = res.data;

//       if (data.isReceipt) {
//         setDescription(data.description || "");
//         setAmount(data.amount || "");
//         setDate(data.date ? new Date(data.date).toISOString().slice(0, 10) : "");
//         setCategory(data.category || "Other");
//         alert("Receipt scanned successfully!");
//       } else {
//         alert("Invalid receipt.");
//       }
//     } catch (err) {
//       console.error("Receipt scan failed:", err);
//       alert("Failed to scan receipt.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="back">
//         <BackButton />
//       </div>

//       <div className={styles.container}>
//         <h1>Add New Expense</h1>

//         <form onSubmit={handleSubmit} className={styles.form}>
//           <label>
//             Description:
//             <input
//               type="text"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//             />
//           </label>
//           <label>
//             Amount (₹):
//             <input
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               required
//             />
//           </label>
//           <label>
//             Date:
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               required
//             />
//           </label>
//           <label>
//             Category:
//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               required
//             >
//               <option value="Food">Food</option>
//               <option value="Travel">Travel</option>
//               <option value="Shopping">Shopping</option>
//               <option value="Education">Education</option>
//               <option value="Home">Home</option>
//               <option value="Bills">Bills</option>
//               <option value="Tax">Tax</option>
//               <option value="Luxuries">Luxuries</option>
//               <option value="Entertainment & Sports">Entertainment & Sports</option>
//               <option value="Electronics">Electronics</option>
//               <option value="Miscellanous">Miscellanous</option>
//             </select>
//           </label>

//           <h1>OR</h1>

//           <div className={styles.uploadSection}>
//             <h2>Upload a Receipt</h2>
//             <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//             <button
//               type="button"
//               onClick={handleFileUpload}
//               disabled={loading || !file}
//             >
//               {loading ? "Scanning..." : "Upload & Scan"}
//             </button>
//           </div>

//           <button type="submit" disabled={loading}>
//             Add Expense
//           </button>
//         </form>
//       </div>
//     </>
//   );
// };

// export default AddExpense;


import React, { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/AddExpense.module.css";
import BackButton from "../components/backbutton";

const AddExpense = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const authToken = await getToken();
    if (!authToken) return;
  
    const newExpense = {
      description,
      amount: parseFloat(amount),
      category,
      date,
    };
  
    try {
      const res = await axios.post("http://localhost:8000/expenses/", newExpense, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setExpenses((prev) => [...prev, res.data]);
      alert("Expense added successfully!");
      
      // Clear form after successful submission
      setDescription("");
      setAmount("");
      setCategory("Food");
      setDate(new Date().toISOString().slice(0, 10));
      setFile(null);
      
    } catch (err) {
      console.error(err);
      alert("Failed to add expense.");
    }
  };

  const handleFileUpload = async () => {
    const authToken = await getToken();
    if (!file || !authToken) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/receiptscanner/scan_receipt/", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      if (data.isReceipt) {
        setDescription(data.description || "");
        setAmount(data.amount || "");
        setDate(data.date ? new Date(data.date).toISOString().slice(0, 10) : "");
        setCategory(data.category || "Other");
        alert("Receipt scanned successfully!");
      } else {
        alert("Invalid receipt.");
      }
    } catch (err) {
      console.error("Receipt scan failed:", err);
      alert("Failed to scan receipt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="back">
        <BackButton />
      </div>

      <div className={styles.container}>
        <h1>Add New Expense</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Description:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter expense description"
            />
          </label>
          <label>
            Amount (₹):
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label>
            Category:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Education">Education</option>
              <option value="Home">Home</option>
              <option value="Bills">Bills</option>
              <option value="Tax">Tax</option>
              <option value="Luxuries">Luxuries</option>
              <option value="Entertainment & Sports">Entertainment & Sports</option>
              <option value="Electronics">Electronics</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </label>

          <h1>OR</h1>

          <div className={styles.uploadSection}>
            <h2>Upload a Receipt</h2>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
              accept="image/*"
            />
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={loading || !file}
            >
              {loading ? "Scanning..." : "Upload & Scan"}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            Add Expense
          </button>
        </form>
      </div>
    </>
  );
};

export default AddExpense;