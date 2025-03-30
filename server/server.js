const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3001;


// Gemini
const { analyzeInterestsForLocation, userInterests } = require('./geminiService');


// Middleware
app.use(cors());
app.use(express.json());


// Google Places API key from environment variables
const GOOGLE_API_KEY = "AIzaSyCITFRjNxvqBUEyktGp9BnBg7stWCQPKuE";


app.get('/api/places/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 1000, type = 'restaurant' } = req.query;
    
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


app.get('/api/recommendations', async (req, res) => {
   try {
     const { nearbyData, interests } = req.query;

      // Get recommendations based on interests
     const recommendations = await analyzeInterestsForLocation(
       placesResponse.data.results,
       interests
     );
      // Return both the raw places data and the AI recommendations
     res.json({
       interests: userInterests,
       recommendations,
       places: placesResponse.data.results.slice(0, 10)
     });
   } catch (error) {
     console.error('Error generating recommendations:', error);
     res.status(500).json({ error: 'Failed to generate recommendations' });
   }
});


// In your backend
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ error: 'Something went wrong!' });
 });
 // Start server
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});


