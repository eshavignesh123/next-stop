const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { analyzeInterestsForLocation, generateOptimizedSchedule } = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Places API key from environment variables
const GOOGLE_API_KEY = "AIzaSyCITFRjNxvqBUEyktGp9BnBg7stWCQPKuE";
const GOOGLE_MAPS_API_KEY = "AIzaSyAE4-ImfdxgR6kmlw28w9HpnG3_vjznuB8";

// Route for getting nearby places based on coordinates
app.get('/api/places/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 1000, type } = req.query;
    // Validate parameters
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    if (radius > 50000) { // Google's max radius
      return res.status(400).json({ error: 'Radius exceeds 50,000 meters' });
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, 
      {
        params: {
          location: `${lat},${lng}`,
          radius: radius,
          type: type,
          key: GOOGLE_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Backend API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch places',
      details: error.response?.data || {}
    });
  }
});

// Route to handle recommendations (based on interests)
app.post('/api/recommendations', async (req, res) => {
  try {
    const { nearbyData, interests } = req.body;

    if (!nearbyData || !interests) {
      return res.status(400).json({ error: 'Missing nearbyData or interests' });
    }

    // Get recommendations based on interests
    const recommendations = await analyzeInterestsForLocation(nearbyData, interests);

    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});


// Route to handle Google Maps API route planning
app.post('/api/route', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json`,
      {
        params: {
          origin,
          destination,
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error generating route:', error);
    res.status(500).json({ error: 'Failed to generate route' });
  }
});

// Route to generate optimized schedule
app.post('/api/schedule', async (req, res) => {
  try {
    const { recommendations, routeTimes, delayTime, date } = req.body;

    if (!recommendations || !routeTimes || !delayTime) {
      return res.status(400).json({ error: 'Missing recommendations, routeTimes or delayTime' });
    }

    // Get optimized schedule
    const result = await generateOptimizedSchedule(recommendations, routeTimes, delayTime, date);

    res.json(result);
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ error: 'Failed to generate schedule' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
