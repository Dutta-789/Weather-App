// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Backend is up and running!');
});

// MapTiler Geocoding Route
app.get('/map', async (req, res) => {
  const { query } = req.query;

  const MAPTILER_KEY = process.env.MAPTILER_KEY;

  try {
    const response = await axios.get(`https://api.maptiler.com/geocoding/${query}.json?key=${MAPTILER_KEY}&language=en`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching from MapTiler' });
  }
});

// WeatherAPI Route
app.get('/weather', async (req, res) => {
  const { lat , lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

try {
    const weatherRes = await axios.get(
      `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=5&aqi=yes&alerts=yes`
    );
    res.json(weatherRes.data);
} catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Pixabay Image Search
app.get('/image', async (req, res) => {
  const { query } = req.query;
  const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

  try {
    const response = await axios.get(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&orientation=horizontal`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching images' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
