import fetch from 'node-fetch'; 
export default async (req, res) => { 
const apiKey = process.env.TWELVE_DATA_API_KEY; 
	if (!apiKey) { 
 		return res.status(500).json({ error: 'Server configuration error: API key missing.' }); 
	} 
const { ticker } = req.query; 
	if (!ticker) { 
		return res.status(400).json({ error: 'Ticker symbol is required.' }); 
	} 
const twelveDataUrl = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=100&apikey=${apiKey}`; 
	try { 
	  	const response = await fetch(twelveDataUrl); 
	  	const data = await response.json(); 
		if (data.status === 'error') { return res.status(404).json({ error: data.message || 'Error fetching data from Twelve Data.' }); 
	} 
const formattedData = data.values.reverse().map(item => ({ date: new Date(item.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), price: parseFloat(item.close) })); // 6. Send the clean, CORS-compliant data back to your React app res.status(200).json({ ticker: ticker, data: formattedData }); } catch (error) { console.error('Proxy Fetch Error:', error); res.status(500).json({ error: 'Failed to connect to financial service.' }); } }; 