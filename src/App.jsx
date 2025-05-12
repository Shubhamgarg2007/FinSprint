import './App.css';
// import './styles/stockcss.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import CurrencyConverter from './pages/currencyconverter';
import ExpenseManager from './pages/expensemanager';
import AddExpense from './pages/AddExpense';
import QuizApp from './pages/quiz.jsx';
import StockD from './pages/StockD'
import DeleteExpense from "./pages/DeleteExpense";
import GetExpense from "./pages/GetExpense"; 
import UpdateExpense from './pages/UpdateExpense.jsx';
import PredictComponent from './api/PredictComponent';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ExpenseManager" element={<ExpenseManager />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/delete-expense" element={<DeleteExpense />} />
        <Route path="/update-expense" element={<UpdateExpense />} />

        <Route path="/get-expense" element={<GetExpense />} />
        <Route path="/currency-converter" element={<CurrencyConverter />} />
        <Route path="/quiz" element={<QuizApp/>} />
        <Route path="/stock-dashboard" element={<StockD />} />
        <Route path="/predict" element={<PredictComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
