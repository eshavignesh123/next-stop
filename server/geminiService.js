const { GoogleGenerativeAI } = require("@google/generative-ai");


// Initialize the API with your key
// Get your API key from https://aistudio.google.com/
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBC6zLbOgNvOIZz0O1gmvnDeel5z7gSiKU";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Sample interests list - you can replace this with a database or other source later
const userInterests = [
 "Italian food",
 "Live music",
 "Coffee shops",
 "Bookstores",
 "Art galleries"
];


async function analyzeInterestsForLocation(places, interests) {
 try {
   const prompt = `
     I have the following interests: ${userInterests.join(", ")}.
    
     I have a list of nearby places: ${JSON.stringify(places.map(place => ({
       name: place.name,
       types: place.types,
       rating: place.rating || 'N/A',
       vicinity: place.vicinity
     })))}.
    
     Based on my interests, recommend the top 3 places I should visit from this list.
     For each recommendation, explain why it matches my interests.
     Format the response as a JSON object with an array of recommendations.
     Each recommendation should have: name, reason, and interestMatched.
   `;


   const result = await model.generateContent(prompt);
   const response = result.response.text();
  
   try {
     // Extract JSON from the response
     const jsonMatch = response.match(/``````/) ||
                       response.match(/{[\s\S]*}/);
    
     const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
     return JSON.parse(jsonString);
   } catch (parseError) {
     console.error("Error parsing Gemini response:", parseError);
     return {
       recommendations: [],
       error: "Could not parse recommendations"
     };
   }
 } catch (error) {
   console.error("Error calling Gemini API:", error);
   return {
     recommendations: [],
     error: "Failed to analyze interests"
   };
 }
}


module.exports = {
 analyzeInterestsForLocation,
 userInterests
};



