import React, { useState, useEffect } from "react";
import "../styles/quiz.css";
import BackButton from "../components/backbutton";
import doodle from "/doodles.svg";
import { TiTick } from "react-icons/ti";

const questions = [
  {
    question: 'What does the acronym "IPO" stand for in the stock market?',
    options: [
      "Initial Public Offering",
      "International Purchase Option",
      "Investment Portfolio Order",
      "Internal Profit Outlook",
    ],
    answer: "Initial Public Offering",
  },
  {
    question: "Which of these is NOT a common type of investment?",
    options: ["Stocks", "Bonds", "Mutual Funds", "Premiums"],
    answer: "Premiums",
  },
  {
    question: 'What is a "Bull Market"?',
    options: [
      "A market where prices are falling",
      "A market where prices are rising",
      "A market with no price changes",
      "A market only for agricultural stocks",
    ],
    answer: "A market where prices are rising",
  },
  {
    question: 'What does "Diversification" mean in investing?',
    options: [
      "Buying only tech stocks",
      "Investing all money at once",
      "Spreading investments across various assets to reduce risk",
      "Investing only in foreign markets",
    ],
    answer: "Spreading investments across various assets to reduce risk",
  },
  {
    question:
      "Which financial statement shows a company's revenues and expenses over a specific period?",
    options: [
      "Balance Sheet",
      "Cash Flow Statement",
      "Income Statement",
      "Equity Statement",
    ],
    answer: "Income Statement",
  },
  {
    question: "What is a budget?",
    options: [
      "A loan from the bank",
      "A plan for saving and spending money",
      "A type of investment",
      "An insurance policy",
    ],
    answer: "A plan for saving and spending money",
  },
  {
    question: "What is the purpose of a savings account?",
    options: [
      "To earn rewards",
      "To invest in stocks",
      "To store money securely and earn interest",
      "To pay taxes",
    ],
    answer: "To store money securely and earn interest",
  },
  {
    question: "What does APR stand for in finance?",
    options: [
      "Annual Percentage Rate",
      "Automatic Payment Rate",
      "Authorized Payment Record",
      "Annualized Payment Requirement",
    ],
    answer: "Annual Percentage Rate",
  },
  {
    question: "Why is it important to have an emergency fund?",
    options: [
      "To invest in stocks quickly",
      "To avoid using credit cards for emergencies",
      "To buy luxury goods",
      "To pay your monthly rent",
    ],
    answer: "To avoid using credit cards for emergencies",
  },
  {
    question: 'What is "credit score"?',
    options: [
      "A number that shows your salary",
      "A rating of how risky it is to invest in a stock",
      "A measure of your financial trustworthiness",
      "Your net worth",
    ],
    answer: "A measure of your financial trustworthiness",
  },
  {
    question: "Which one of these is a liability?",
    options: ["Savings", "Investment", "Mortgage", "Salary"],
    answer: "Mortgage",
  },
  {
    question: "Which of the following typically has the highest interest rate?",
    options: [
      "Savings Account",
      "Credit Card Debt",
      "Mortgage Loan",
      "Student Loan",
    ],
    answer: "Credit Card Debt",
  },
  {
    question: 'What does "net income" mean?',
    options: [
      "Total money before taxes",
      "Money spent on investments",
      "Money after expenses and taxes",
      "Loan amount received",
    ],
    answer: "Money after expenses and taxes",
  },
  {
    question: "What is inflation?",
    options: [
      "A decrease in product prices over time",
      "An increase in value of money",
      "A rise in general prices and fall in purchasing power",
      "Money saved in a bank",
    ],
    answer: "A rise in general prices and fall in purchasing power",
  },
  {
    question: "What is compound interest?",
    options: [
      "Interest earned only on the initial amount",
      "Interest deducted from your balance",
      "Interest earned on both the principal and accumulated interest",
      "A penalty fee on loans",
    ],
    answer: "Interest earned on both the principal and accumulated interest",
  },
];

export default function QuizApp() {
  const [page, setPage] = useState("landing");
  const [countdown, setCountdown] = useState(3);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(30); // Changed from 60 to 30 seconds
  const [answers, setAnswers] = useState([]);
  const [randomQuestions, setRandomQuestions] = useState([]);

  // Function to shuffle array and pick 5 random questions
  const getRandomQuestions = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };

  // Set random questions when the quiz starts
  useEffect(() => {
    if (page === "countdown" && countdown === 0) {
      setRandomQuestions(getRandomQuestions());
    }
  }, [countdown, page]);

  useEffect(() => {
    if (page === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (page === "countdown" && countdown === 0) {
      setPage("quiz");
      setQuizStarted(true);
    }
  }, [countdown, page]);

  useEffect(() => {
    if (quizStarted && timer > 0 && !showAnswer) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      handleNext();
    }
  }, [quizStarted, timer, showAnswer]);

  const handleNext = () => {
    setAnswers([
      ...answers,
      {
        selected: selectedOption,
        correct: randomQuestions[currentQuestion].answer,
      },
    ]);
    setSelectedOption(null);
    setShowAnswer(false);
    setTimer(30); // Reset timer to 30 seconds
    if (currentQuestion + 1 < 5) {
      // Now we only have 5 questions
      setCurrentQuestion((q) => q + 1);
    } else {
      setPage("end");
      setQuizStarted(false);
    }
  };

  const renderLanding = () => (
    <>
      <div className="back">
        <BackButton />
      </div>
      <div className="landing-page">
        <div className="landing-content">
          <h1 className="landing-title">Welcome to Quizify!</h1>
          <h2 className="landing-subtitle">Things to know before you start:</h2>
          <ul className="landing-list">
            <li>
              <span className="check-mark">
                <TiTick />
              </span>
              <span>
                Consider downloading the PDF by clicking on the{" "}
                <strong>Download PDF</strong> button to gain some knowledge
                about Finance before attempting the quiz.{" "}
              </span>
            </li>
            <li>
              <span className="check-mark">
                <TiTick />
              </span>
              <span>
                In each quiz, you are required to answer 5 random questions from
                our question bank.
              </span>
            </li>
            <li>
              <span className="check-mark">
                <TiTick />
              </span>
              <span>
                You will have 30 seconds for each question. If you fail to
                complete a question in given time, your answer will be
                considered incorrect.
              </span>
            </li>
          </ul>
          <button className="btn" onClick={() => setPage("countdown")}>
            Let's Get Started
          </button>
          <button
            className="btn"
            onClick={() => {
              // Create a link element and trigger download of material.pdf
              const link = document.createElement("a");
              link.href = "material.pdf";
              link.download = "material.pdf";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download PDF
          </button>
        </div>
        <div className="landing-illustration">
          <img src={doodle} alt="Study illustration" className="doodle-image" />
        </div>
      </div>
    </>
  );

  const renderCountdown = () => (
    <div className="countdown-page">
      <div className="countdown-content">
        <h1 className="countdown-title">Welcome to Quizify!</h1>
        <p className="countdown-text">Your quiz starts in</p>
        <div className="countdown-number">{countdown}</div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const q = randomQuestions[currentQuestion];
    return (
      <div className="quiz-container">
        <h1 className="quiz-title">Quiz</h1>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((30 - timer) * 100) / 30}%` }}
          ></div>
        </div>
        <h2 className="question-heading">Question {currentQuestion + 1} / 5</h2>
        <p className="question-text">{q.question}</p>
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn ${
              showAnswer
                ? opt === q.answer
                  ? "correct"
                  : selectedOption === opt
                  ? "incorrect"
                  : ""
                : selectedOption === opt
                ? "selected"
                : ""
            }`}
            onClick={() => {
              if (!showAnswer) {
                setSelectedOption(opt);
                setShowAnswer(true);
              }
            }}
          >
            {opt}
            {showAnswer && opt === q.answer && <span>✔</span>}
            {showAnswer &&
              selectedOption === opt &&
              selectedOption !== q.answer && <span>✖</span>}
          </button>
        ))}
        {showAnswer && (
          <button className="btn" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    );
  };

  const renderEnd = () => (
    <>
      <div className="back">
        <BackButton />
      </div>
      <div className="end-page">
        <h1 className="end-title">Quiz Completed!</h1>
        <p>You have answered all the questions.</p>
        <p className="end-score">
          Your Score: {answers.filter((a) => a.selected === a.correct).length} /
          5
        </p>
        <button className="btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    </>
  );

  return (
    <div
      className={
        page === "countdown" ? "" : page === "landing" ? "" : "page-container"
      }
    >
      {page === "landing" && renderLanding()}
      {page === "countdown" && renderCountdown()}
      {page === "quiz" && renderQuiz()}
      {page === "end" && renderEnd()}
    </div>
  );
}
