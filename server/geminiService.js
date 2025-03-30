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

module.exports = {
  analyzeInterestsForLocation,
};
