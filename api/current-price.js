// Vercel Serverless Function to proxy requests for REAL-TIME QUOTES to Twelve Data.
// This is used for quick, periodic updates of the current price.

import fetch from 'node-fetch';

export default async (req, res) => {
// NOTE: Requires TWELVE_DATA_API_KEY environment variable on Vercel
const apiKey = process.env.TWELVE_DATA_API_KEY;
if (!apiKey) {
return res.status(500).json({ error: 'Server configuration error: API key missing.' });
}

const ticker = req.query.ticker;
if (!ticker) {
return res.status(400).json({ error: 'Ticker symbol is required.' });
}

// Use the /quote endpoint for current real-time price
const twelveDataUrl = `https://api.twelvedata.com/quote?symbol=${ticker}&apikey=${apiKey}`;

try {
const response = await fetch(twelveDataUrl);
const data = await response.json();

if (data.status === 'error' || !data.close) {
console.error("Twelve Data Quote Error:", data.message || 'Could not retrieve quote.');
// Return 404/429 status if the external API failed
const statusCode = data.message && data.message.includes('rate limit') ? 429 : 404;
return res.status(statusCode).json({ error: data.message || `Could not fetch current price for ${ticker}.` });
}

// Extract necessary current price information
const currentPriceData = {
price: parseFloat(data.close),
// Use the trading date provided by the API
date: data.datetime,
changePercent: parseFloat(data.percent_change)
};

// Send the real-time quote back to the client
res.status(200).json(currentPriceData);

} catch (error) {
console.error('Proxy Fetch Error:', error);
res.status(500).json({ error: 'Failed to connect to external service for real-time price.' });
}
};