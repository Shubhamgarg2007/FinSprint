import { useEffect, useState } from 'react';
import { Search, Moon } from 'lucide-react';
import "../styles/StockDashboardcss.css"; // Import your CSS file for styling
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
// --- Import the REAL API functions ---
import { searchStock, getStockDetails, fetchStockHistory } from '../api/api'; // Adjust the path if stockApi.js is elsewhere
import { useNavigate } from "react-router-dom";
import BackButton from "../components/backbutton";


export default function StockDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [stockData, setStockData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [timeframe, setTimeframe] = useState('1W');
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]); // To show search suggestions
    const [showSearchResults, setShowSearchResults] = useState(false); // Control visibility

    // --- Debounced Search (Optional but Recommended) ---
    useEffect(() => {
        if (searchTerm.length < 1) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            try {
                setError(null); // Clear previous errors on new search
                const results = await searchStock(searchTerm);
                // Ensure results is always an array and has symbol and name
                const formattedResults = results
                    .map(r => ({ symbol: r.symbol, name: r.name || r.shortname || r.symbol })) // Adjust based on actual search API response fields
                    .filter(r => r.symbol); // Ensure symbol exists
                setSearchResults(formattedResults);
                setShowSearchResults(true);
            } catch (err) {
                console.error("Debounced search failed:", err);
                setError(err.message || "Search failed.");
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer); // Cleanup timer on unmount or search term change
    }, [searchTerm]);


    // --- Select Stock from Search Results ---
    const handleSelectStock = (symbol, name) => {
        setSelectedSymbol(symbol);
        setSearchTerm(name || symbol); // Update input field to show selected stock name/symbol
        setSearchResults([]); // Clear results
        setShowSearchResults(false); // Hide dropdown
        // Data fetching is triggered by the useEffect watching selectedSymbol
    };

    // --- Fetch stock details + chart when symbol or timeframe changes ---
    useEffect(() => {
        const fetchDetailsAndChart = async () => {
            if (!selectedSymbol) {
                // Optionally clear data or set a default state if no symbol is selected
                // setStockData(null);
                // setChartData([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Fetch details and history concurrently
                const [details, history] = await Promise.all([
                    getStockDetails(selectedSymbol),
                    fetchStockHistory(selectedSymbol, timeframe),
                ]);

                // Check if details or history fetch failed (API function might return null/empty or throw)
                if (!details) {
                    throw new Error(`Could not fetch details for ${selectedSymbol}.`);
                }
                if (!history || history.length === 0) {
                    console.warn(`No history data returned for ${selectedSymbol} (${timeframe})`);
                    // Decide how to handle missing history: show message, empty chart, etc.
                }

                setStockData(details);
                setChartData(
                    history.map(item => ({
                        date: item.date, // Expecting YYYY-MM-DD string from API function
                        price: parseFloat(item.close),
                    })).filter(item => !isNaN(item.price) && item.date) // Ensure data is clean
                );

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || `Failed to load data for ${selectedSymbol}.`);
                // Keep existing data or clear it? Clearing might be better UX.
                setStockData(null);
                setChartData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetailsAndChart();
    }, [selectedSymbol, timeframe]); // Dependencies: symbol and timeframe

    // --- Load default data on initial mount ---
    useEffect(() => {
        const initialSymbol = 'AAPL'; // Example: Default to Apple
        setSelectedSymbol(initialSymbol);
        // Optionally set search term to match initially loaded stock
        // getStockDetails(initialSymbol).then(details => {
        //     if (details) setSearchTerm(details.companyName || initialSymbol);
        // });
    }, []); // Runs once on mount

    // --- JSX Structure (incorporating search dropdown) ---
    return (
        <>
            {/* Make sure you link your CSS file in the head of your HTML */}
            {/* <link rel="stylesheet" href="/path/to/styles.css"> */}

            <div className="dashboard-container">

                {/* Header */}
                <div className="header-container">
                    <div className="back">
                        <BackButton />
                    </div>
                    <h1 className="header-title">
                        {isLoading && !stockData ? 'Loading...' : stockData ? stockData.companyName : error && !stockData ? 'Error Loading Stock' : 'Stock Dashboard'}
                    </h1>
                    <div className="header-controls">
                        {/* --- Search Input Area with Dropdown --- */}
                        <div className="search-area">
                            <input
                                type="text"
                                placeholder="Search stock..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSearchResults(true); // Show dropdown while typing
                                }}
                                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)} // Hide dropdown on blur with delay
                                onFocus={() => searchTerm.length > 0 && setShowSearchResults(true)} // Show dropdown on focus if there's text
                            />
                            <Search
                                className="search-icon"
                                // Keep onClick for manual search if needed, or remove if selection is only via dropdown/enter
                                onClick={() => searchTerm && handleSelectStock(searchTerm.toUpperCase(), searchTerm)} // Simple fallback
                            />
                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <ul className="search-results-dropdown">
                                    {searchResults.map((result) => (
                                        <li
                                            key={result.symbol}
                                            className="search-result-item"
                                            // Use onMouseDown to fire before onBlur hides the list
                                            onMouseDown={() => handleSelectStock(result.symbol, result.name)}
                                        >
                                            <span className="font-semibold">{result.symbol}</span> - {result.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {/* --- End Search --- */}
                        {/* <button className="rounded-full bg-[#b0acf7] p-2 hover:bg-[#9a92e7]">
                             <Moon size={16} className="text-[#090b12]" />
                         </button> */}
                    </div>
                </div>

                {/* Display general error messages */}
                {error && !isLoading && ( // Show error only when not loading to avoid flicker
                    <div className="error-message">
                        Error: {error}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="main-content-grid">

                    {/* Chart Panel */}
                    <div className="chart-panel">
                        <div className="chart-container"> {/* Ensure chart has enough height */}
                            {isLoading && chartData.length === 0 ? (
                                <div className="loading-message">Loading Chart...</div>
                            ) : chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                        <defs>
                                            {/* Gradient using primary accent color */}
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#5b4bc4" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#5b4bc4" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>

                                        {/* Axis styling: Dark text (handled by CSS class `.recharts-wrapper .recharts-cartesian-axis-tick text` above) */}
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: '#4b5563' }} // Explicit style as Recharts applies inline
                                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            interval="preserveStartEnd"
                                            minTickGap={30} // Adjust gap based on timeframe/data density
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#4b5563' }} // Explicit style as Recharts applies inline
                                            tickFormatter={(value) => `${stockData.currency}${value.toFixed(0)}`} // Format ticks
                                            domain={['auto', 'auto']}
                                            orientation="right"
                                            axisLine={false}
                                            tickLine={false}
                                            width={40} // Adjust width for labels
                                        />

                                        {/* Tooltip styling: Light background, dark text, accent border */}
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #b0acf7', // Secondary accent border
                                                color: '#090b12', // Dark text
                                                borderRadius: '6px',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                                fontSize: '12px',
                                                padding: '8px 12px',
                                            }}
                                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#090b12' }}
                                            itemStyle={{ color: '#5b4bc4' }} // Primary accent for price line
                                            labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                                            formatter={(value, name) => [`${stockData.currency}${value.toFixed(2)}`, 'Price']} // Format price in tooltip
                                        />

                                        {/* Line styling: Primary accent color */}
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#5b4bc4" // Primary accent
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 5, fill: '#5b4bc4', stroke: '#f9faff', strokeWidth: 2 }}
                                            isAnimationActive={true} // Enable animation on load/change
                                        // fill="url(#colorPrice)" // Optional: Add fill gradient below line
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : !isLoading ? (
                                <div className="no-data-message">No chart data available.</div>
                            ) : null /* Covers the case where loading is true but chartData is empty */}
                        </div>

                        {/* Timeframe Selector */}
                        <div className="timeframe-selector">
                            {['1D', '1W', '1M', '1Y'].map((option) => (
                                <button
                                    key={option}
                                    className={`timeframe-button ${timeframe === option ? 'active' : ''}`}
                                    onClick={() => setTimeframe(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Stock Info Panel - Styling remains the same */}
                    <div className="stock-info-panel">
                        {isLoading && !stockData ? ( // Show loading only if details are empty
                            <div className="loading-details">Loading Details...</div>
                        ) : stockData ? (
                            <>
                                {/* ... (Price, Change%, Details List - styling unchanged) ... */}
                                <div className="stock-price-section">
                                    <div className="price-line">
                                        <h2 className="current-price">{stockData.currentPrice?.toFixed(2)}</h2>
                                        <span className="currency">{stockData.currency}</span>
                                    </div>
                                    {/* Apply conditional class based on change value */}
                                    <div className={`change-indicator ${stockData.change < 0 ? 'negative' : 'positive'}`}>
                                        {stockData.change >= 0 ? '+' : ''}{stockData.change?.toFixed(2)} ({stockData.changePercent >= 0 ? '+' : ''}{Number(stockData.changePercent)?.toFixed(2)}%)
                                    </div>
                                </div>
                                <div className="stock-details-list">
                                    <div className="detail-item"> <span className="detail-label">Name</span> <span className="detail-value text-right">{stockData.companyName}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">Country</span> <span className="detail-value">{stockData.country}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">Exchange</span> <span className="detail-value">{stockData.exchange}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">Dividend Rate</span> <span className="detail-value">{stockData.dividendRate}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">Market Cap</span> <span className="detail-value">{stockData.marketCap}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">Fifty Day Avg</span> <span className="detail-value text-right">{stockData.FiftyDayAvg}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">FiftyDayAvgChange</span> <span className="detail-value text-right">{stockData.FiftyDayAvgChange}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">FiftyTwoWeekHighChange</span> <span className="detail-value text-right">{stockData.FiftyTwoWeekHighChange}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">FiftyTwoWeekLow</span> <span className="detail-value text-right">{stockData.FiftyTwoWeekLow}</span> </div>
                                    <div className="detail-item"> <span className="detail-label">FiftyTwoWeekLowChange</span> <span className="detail-value text-right">{stockData.FiftyTwoWeekLowChange}</span> </div>
                                    {/* <div className="detail-item"> <span className="detail-label">marketStatus</span> <span className="detail-value text-right">{stockData.marketStatus}</span> </div> */}
                                </div>
                            </>
                        ) : (
                            !isLoading && selectedSymbol && <p className="no-data-message">No details available for {selectedSymbol}.</p> // Specific no data message
                        ) || (
                            !isLoading && !selectedSymbol && <p className="no-data-message">Search for a stock symbol to see details.</p> // Initial state message
                        )
                        }
                    </div>

                </div>
            </div>
        </>
    );
}