// stockApi.js
import axios from 'axios';

const SEARCH_URL = 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/search';
const HISTORY_URL = 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/history';
const QUOTE_URL = 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes';

// --- IMPORTANT: Read API Key from Environment Variables ---
const apiKey = import.meta.env.VITE_STOCK_API_KEY;


if (!apiKey) {
  console.error("ERROR: VITE_RAPIDAPI_KEY environment variable not set!");
  // You might want to throw an error or handle this more gracefully
}

const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': apiKey, // Use the key from environment variable
    'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com',
  },
};

const timeframeToParams = {
  '1D': { interval: '5m', range: '1d' },  // Added range for potentially better 1D data
  '1W': { interval: '15m', range: '5d' }, // Adjusted range for 1W
  '1M': { interval: '1d', range: '1mo' },
  '1Y': { interval: '1wk', range: '1y' },
};

export const searchStock = async (query) => {
  if (!apiKey) return Promise.reject(new Error("API Key not configured.")); // Prevent API call if key is missing
  try {
    const { data } = await axios.get(SEARCH_URL, {
      params: { search: query },
      ...options,
    });
    // console.log('Search Response:', data); // Optional: for debugging
    // Ensure the response structure is handled correctly
    return data.body || []; // Adjust based on actual API response for search
  } catch (error) {
    console.error('Error searching stock:', error?.response?.data || error.message);
    return [];
  }
};

export const fetchStockHistory = async (symbol, timeframe) => {
    if (!apiKey) return Promise.reject(new Error("API Key not configured."));
    try {
      // Assuming timeframeToParams is defined elsewhere and maps
      // timeframe strings (like '1W') to { interval, range } objects
      const { interval, range } = timeframeToParams[timeframe] || timeframeToParams['1W'];
  
      const { data } = await axios.get(HISTORY_URL, {
        params: {
          symbol,
          interval,
          range,
          // Include diffandsplits if needed by the API and supported
          // diffandsplits: 'false'
        },
        ...options, // Assumes your headers and other axios options are here
      });
  
      // console.log('History Response:', data); // Optional: for debugging
  
      const rawHistoryData = data?.body;
  
      if (!rawHistoryData || Object.keys(rawHistoryData).length === 0) {
        console.warn(`No history data returned for ${symbol} (${timeframe})`);
        return []; // Return empty array if body is null, undefined, or empty
      }
  
      // Extract data points by iterating through the body object's keys (timestamps)
      const historyDataArray = Object.keys(rawHistoryData)
        .map(timestampKey => {
          const dataPoint = rawHistoryData[timestampKey];
          // Ensure 'close' or equivalent field exists in the dataPoint
          // You might need to check the exact field name from the API response,
          // it's commonly 'close', 'adjclose', or similar. Let's assume 'close' for now.
          const closePrice = dataPoint.close; // <-- Access the close price here
          const dateUtc = dataPoint.date_utc; // Or use dataPoint.date_utc for the timestamp
  
          // Validate data point
          if (closePrice === undefined || closePrice === null || isNaN(parseFloat(closePrice))) {
               // console.warn(`Skipping invalid data point for ${symbol} at timestamp ${timestampKey}`);
               return null; // Skip this data point if close is invalid
          }
  
  
          return {
            // Use the timestamp key or dataPoint.date_utc
            // Convert Unix timestamp (seconds) to milliseconds for Date constructor
            date: new Date(dateUtc * 1000).toISOString().split('T')[0], // Format as YYYY-MM-DD
            timestamp: dateUtc, // Keep the UTC timestamp if needed for charting
            close: parseFloat(closePrice),
            // You might also want open, high, low, volume here depending on your chart
            open: parseFloat(dataPoint.open),
            high: parseFloat(dataPoint.high),
            low: parseFloat(dataPoint.low),
            // volume: parseFloat(dataPoint.volume) // if volume exists
          };
        })
        .filter(item => item !== null); // Filter out any null entries from skipped points
  
       // Optional: Sort data by timestamp if not guaranteed by API
       historyDataArray.sort((a, b) => a.timestamp - b.timestamp);
  
  
      if (historyDataArray.length === 0) {
           console.warn(`Filtered data is empty for ${symbol} (${timeframe}). Check data fields (e.g., 'close').`);
           return [];
      }
  
  
      // Now return the formatted array
      return historyDataArray;
  
    } catch (error) {
      console.error(`Error loading stock history for ${symbol}:`, error?.response?.data || error.message);
      // Re-throw or handle the error as needed
      throw new Error(`Failed to load history for ${symbol}. ${error?.response?.data?.message || ''}`);
    }
  };


export const getStockDetails = async (ticker) => {
   if (!apiKey) return Promise.reject(new Error("API Key not configured."));
  try {
    const { data } = await axios.get(QUOTE_URL, {
      // The API seems to expect multiple tickers separated by commas
      params: { ticker: ticker }, // Changed 'ticker' param name to 'symbol' based on common API patterns
      ...options,
    });

    // console.log('Quote Response:', data); // Optional: for debugging

    // Find the specific stock data in the response array
    // The API might return an object where keys are symbols, or an array. Adjust accordingly.
    let stock;
    if (Array.isArray(data?.body)) {
        stock = data.body.find(item => item.symbol === ticker);
    } else if (typeof data?.body === 'object' && data?.body !== null) {
        stock = data.body[ticker]; // If the response is an object keyed by symbol
    }
    // console.log('Stock Data:', stock); // Optional: for debugging

    if (!stock) {
       console.warn(`No detailed stock data found in response for ticker: ${ticker}`, data);
      throw new Error(`No detailed stock data found for ticker: ${ticker}`);
    }

    // Safely parse float values, providing 0 as fallback
    const safeParseFloat = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // Format market cap (optional)
    const formatMarketCap = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return 'N/A';
        if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
        return value.toString();
    }

    return {
      symbol: stock.symbol || ticker,
      companyName: stock.longName || stock.shortName || 'N/A',
      currentPrice: safeParseFloat(stock.regularMarketPrice),
      change: safeParseFloat(stock.regularMarketChange),
      changePercent: safeParseFloat(stock.regularMarketChangePercent),
      currency: stock.currency || 'USD',
      exchange: stock.fullExchangeName || 'N/A',
      dividendRate: stock.dividendRate || 'N/A', // API might not provide this
      marketCap: formatMarketCap(safeParseFloat(stock.marketCap)), // Use formatter
      FiftyDayAvg : safeParseFloat(stock.fiftyDayAverage) || 'N/A',
      FiftyDayAvgChange: safeParseFloat(stock.fiftyDayAverageChange) || 'N/A',
      FiftyTwoWeekHigh: safeParseFloat(stock.fiftyTwoWeekHigh) || 'N/A',
      FiftyTwoWeekHighChange: safeParseFloat(stock.fiftyTwoWeekHighChange) || 'N/A',
      FiftyTwoWeekLow: safeParseFloat(stock.fiftyTwoWeekLow) || 'N/A',
      FiftyTwoWeekLowChange: safeParseFloat(stock.fiftyTwoWeekLowChange) || 'N/A',
      marketStatus: stock.marketState || 'N/A',
    };
  } catch (error) {
    console.error(`Error fetching stock details for ${ticker}:`, error?.response?.data || error.message);
     // Propagate a more specific error message
    throw new Error(`Failed to load details for ${ticker}. ${error?.response?.data?.message || 'Check symbol and API key.'}`);
  }
};