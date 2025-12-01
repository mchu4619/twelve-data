// Vercel Serverless Function to proxy requests to Twelve Data.
// The "type": "module" in package.json allows us to use 'import/export'.

import fetch from 'node-fetch';

// The Vercel function handler
export default async (req, res) => {
// 1. Retrieve the API Key from the Vercel environment variables (SECURE!)
// NOTE: This must be set in Vercel: TWELVE_DATA_API_KEY
const apiKey = process.env.TWELVE_DATA_API_KEY;
if (!apiKey) {
// Send a 500 error if the key isn't configured
return res.status(500).json({ error: 'Server configuration error: API key missing on Vercel.' });
}

// 2. Extract the ticker symbol from the request URL query parameters
const ticker = req.query.ticker;
if (!ticker) {
return res.status(400).json({ error: 'Ticker symbol is required.' });
}

// 3. Construct the secure Twelve Data API URL
const twelveDataUrl = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=100&apikey=${apiKey}`;

try {
// 4. Perform the secure server-to-server fetch (bypasses CORS)
const response = await fetch(twelveDataUrl);
const data = await response.json();

if (data.status === 'error') {
// Twelve Data returns status: error if the symbol is bad or API limit is hit
console.error("Twelve Data Error:", data.message);
return res.status(404).json({ error: data.message || 'Error fetching data from Twelve Data. Check symbol or API limits.' });
}

// Twelve Data returns data in descending order (newest first).
// 5. Process and format the data for the React chart (reversing to oldest first)
const formattedData = data.values.reverse().map(item => ({
date: new Date(item.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
price: parseFloat(item.close)
}));

// 6. Send the clean, CORS-compliant data back to your React app
res.status(200).json({ ticker: ticker, data: formattedData });

} catch (error) {
console.error('Proxy Fetch Error:', error);
res.status(500).json({ error: 'Failed to connect to financial service due to network error.' });
}
};
