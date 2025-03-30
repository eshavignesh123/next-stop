const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the API with your key
const GEMINI_API_KEY = "AIzaSyBC6zLbOgNvOIZz0O1gmvnDeel5z7gSiKU";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function analyzeInterestsForLocation(places, interests) {
  try {
    console.log("Places:", places);
    const prompt = `I have the following interests: ${interests}.

      I have a list of nearby places: ${JSON.stringify(places.map(place => ({
        name: place.name,
        types: place.types,
        rating: place.rating || 'N/A',
        vicinity: place.vicinity,
        isOpen: place.opening_hours ? place.opening_hours.open_now : 'N/A'
      })))}.

      Based on my interests, recommend the top 3 places I should visit from this list.
      For each recommendation, explain why it matches my interests.
      Format the response as a JSON object with an array of recommendations.
      Each recommendation should have: name, 10-word limit reason, rating, vicinity, and isOpen`; // Keep your existing prompt
    
    const result = await model.generateContent(prompt);
    const response = (await result.response).text();
    
    // Improved response cleaning
    let cleanedResponse = response
      .replace(/```json/g, '')  // Removing start of JSON block
      .replace(/```/g, '')      // Removing end of block
      .replace(/\n/g, '')       // Remove line breaks
      .trim();                 // Remove excess whitespace
    
    console.log("Cleaned Response:", cleanedResponse);
    // Try parsing the cleaned response
    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", cleanedResponse);
      return {
        recommendations: [],
        error: "Could not parse API response"
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      recommendations: [],
      error: "Failed to analyze interests"
    };
  }
}
async function generateOptimizedSchedule(recommendations, routeTimes, delayTime, date) {
  
  try {
    // Log input data for debugging
    console.log("Recommendations:", recommendations);
    console.log("Route Times:", routeTimes);

    const prompt = `I have a list of recommended activities: ${JSON.stringify(recommendations)},  
    each with a duration: ${JSON.stringify(routeTimes)}. My train is delayed by ${delayTime} minutes,  
    and the current time is ${date}.  
    
    Generate an optimized schedule that:  
    - Ensures I return to the train **at least 5 minutes before departure**.  
    - Maximizes enjoyment while minimizing travel time.  
    - Accounts for activity durations and opening hours.  
    - Avoids negative time values.  
    
    Format the response as a JSON object containing an array of scheduled activities.  
    Each activity should include:  
    - **name** (string)  
    - **startingTime** (string, formatted as HH:mm)  
    - **endingTime** (string, formatted as HH:mm)  
    - **totalTime** (integer, minutes spent)  
    - **location** (string)  
    - **notes** (string, if applicable)  
    
    Keep the response concise while ensuring feasibility.`;  
    const result = await model.generateContent(prompt);
    const response = (await result.response).text();

    // Clean and parse the response
    let cleanedResponse = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\n/g, '')
      .trim();

    console.log("Cleaned Response:", cleanedResponse);

    // Try parsing the cleaned response
    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", cleanedResponse);
      return {
        schedule: [],
        error: "Could not parse API response"
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      schedule: [],
      error: "Failed to generate optimized schedule"
    };
  }
}

module.exports = {
  analyzeInterestsForLocation,
  generateOptimizedSchedule
};
