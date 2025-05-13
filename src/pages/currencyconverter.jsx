import React, { useState, useEffect } from "react";
import { RefreshCw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/CurrencyConverter.css";
import BackButton from "../components/backbutton";
import DollarIcon from "../assets/dollar.svg";
import RupeeIcon from "../assets/rupee.svg";
import EuroIcon from "../assets/euro.svg";
import YenIcon from "../assets/yen.svg";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Test change
const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencies, setCurrencies] = useState({});
  const [currencyDetails, setCurrencyDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrenciesAndDetails();
  }, []);

  useEffect(() => {
    if (fromCurrency && toCurrency && !isLoading) {
      convertCurrency();
    }
  }, [fromCurrency, toCurrency, amount, isLoading]);

  const fetchCurrenciesAndDetails = async () => {
    setIsLoading(true);
    setIsDetailsLoading(true);

    try {
      // Fetch exchange rates
      const ratesResponse = await fetch(
        "https://open.er-api.com/v6/latest/USD"
      );
      if (!ratesResponse.ok) {
        throw new Error("Failed to fetch exchange rates");
      }
      const ratesData = await ratesResponse.json();
      setCurrencies(ratesData.rates);
      setLastUpdated(new Date(ratesData.time_last_update_utc).toLocaleString());
      setIsLoading(false);

      // Fetch currency details from a currency information API
      const detailsResponse = await fetch(
        "https://openexchangerates.org/api/currencies.json"
      );
      if (!detailsResponse.ok) {
        throw new Error("Failed to fetch currency details");
      }
      const currencyNames = await detailsResponse.json();

      // Create a structured details object similar to the original
      const details = {};
      for (const [code, name] of Object.entries(currencyNames)) {
        details[code] = {
          name: name,
          // Note: The free API doesn't provide country information
          // You could use a separate API or mapping for countries if needed
          country: getCurrencyCountry(code, name),
        };
      }

      setCurrencyDetails(details);
      setIsDetailsLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching currency data. Please try again later.");
      setIsLoading(false);
      setIsDetailsLoading(false);
    }
  };

  // Helper function to provide country names (simplified example)
  // In a production app, you might want to use a more comprehensive mapping or another API

  const getCurrencyCountry = (code, name) => {
    const commonCurrencyCountries = {
      USD: "United States",
      EUR: "European Union",
      GBP: "United Kingdom",
      JPY: "Japan",
      AUD: "Australia",
      CAD: "Canada",
      CHF: "Switzerland",
      CNY: "China",
      INR: "India",
      // Add more mappings as needed
    };

    return commonCurrencyCountries[code] || name.includes("Pound")
      ? name.replace(" Pound", "")
      : name.includes("Dollar")
      ? name.replace(" Dollar", "")
      : name.includes("Franc")
      ? name.replace(" Franc", "")
      : name;
  };

  const convertCurrency = () => {
    if (!amount || isNaN(amount)) {
      setConvertedAmount(null);
      return;
    }

    try {
      if (fromCurrency === toCurrency) {
        setExchangeRate(1);
        setConvertedAmount(amount);
        return;
      }

      if (Object.keys(currencies).length > 0) {
        const fromRate = currencies[fromCurrency];
        const toRate = currencies[toCurrency];

        if (fromRate && toRate) {
          const rate = toRate / fromRate;
          setExchangeRate(rate);
          setConvertedAmount((amount * rate).toFixed(4));
        }
      }
    } catch (err) {
      setError("Error converting currencies. Please try again later.");
    }
  };

  const handleAmountChange = (e) => setAmount(e.target.value);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleRefresh = () => {
    fetchCurrenciesAndDetails();
  };

  const getCurrencyLabel = (code) => {
    if (isDetailsLoading || !currencyDetails[code]) {
      return code;
    }
    return `${code} - ${currencyDetails[code].name} (${currencyDetails[code].country})`;
  };

  return (
    <>
      <div className="back">
        <BackButton />
      </div>

      <div className="converter-container">
        <div className="currency-animation-wrapper">
          <div className="currency-animation-track">
            {Array.from({ length: 32 }).map((_, i) => {
              const icons = [DollarIcon, RupeeIcon, EuroIcon, YenIcon];
              const Icon = icons[i % 4];
              return <img key={i} src={Icon} alt={`Currency ${i}`} />;
            })}
          </div>
        </div>

        <div className="converter-box">
          <div className="converter-header">
            <h1 className="title">Currency Converter</h1>
            <p className="subtitle">
              {isLoading
                ? "Fetching latest rates..."
                : `Last updated: ${lastUpdated}`}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label className="label">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="input"
            />
          </div>

          <div className="currency-select-row">
            <div className="currency-select">
              <label className="label">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="select"
                disabled={isLoading}
              >
                {Object.keys(currencies).map((currency) => (
                  <option key={currency} value={currency}>
                    {getCurrencyLabel(currency)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwapCurrencies}
              className="swap-button"
              disabled={isLoading}
              onMouseOver={(e) => {
                e.currentTarget.classList.add("hovered");
              }}
              onMouseOut={(e) => {
                e.currentTarget.classList.remove("hovered");
              }}
            >
              <ArrowRight size={20} />
            </button>

            <div className="currency-select">
              <label className="label">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="select"
                disabled={isLoading}
              >
                {Object.keys(currencies).map((currency) => (
                  <option key={currency} value={currency}>
                    {getCurrencyLabel(currency)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="result-box">
            <div className="result-title">
              {isLoading ? "Calculating..." : "Conversion Result"}
            </div>
            <div className="result-value">
              {isLoading ? (
                "Loading..."
              ) : convertedAmount ? (
                <>
                  {amount} {fromCurrency} = {convertedAmount} {toCurrency}
                </>
              ) : (
                "Enter an amount to convert"
              )}
            </div>
            {exchangeRate && (
              <div className="exchange-rate">
                1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="refresh-button"
            disabled={isLoading}
            onMouseOver={(e) => e.currentTarget.classList.add("hovered")}
            onMouseOut={(e) => e.currentTarget.classList.remove("hovered")}
          >
            <RefreshCw size={18} /> Refresh Rates
          </button>
        </div>
      </div>
    </>
  );
};

export default CurrencyConverter;
