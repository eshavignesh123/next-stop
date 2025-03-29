import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const fetchAllStationsDirectly = async () => {
  try {
    const response = await fetch("https://api-v3.amtraker.com/v3/stations");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const stations = await response.json();
    return stations;
  } catch (error) {
    console.error("Error fetching stations:", error);
    throw error;
  }
};

async function generateContent(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    return null;
  }
}

function App() {
  const [trainNumber, setTrainNumber] = useState("");
  const [location, setLocation] = useState("");
  const [trainData, setTrainData] = useState(null);
  const [placesData, setPlacesData] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const API_KEY = "AIzaSyADYpQcPqSp1d47cJx3NZU2W0P7blx8Ag0"; // Replace with your actual API key

  const [amtrakStationId, setAmtrakStationId] = useState("");
  const [amtrakStationName, setAmtrakStationName] = useState("");
  const [allStations, setAllStations] = useState([]);

  // Loads all amtrak stations
  useEffect(() => {
    const loadAmtrakStations = async () => {
      try {
        const stations = await fetchAllStationsDirectly();
        // Convert stations object to array
        const stationsArray = Object.entries(stations).map(
          ([code, details]) => ({
            code,
            name: details.name,
            city: details.city,
            state: details.state,
          })
        );
        setAllStations(stationsArray);
      } catch (err) {
        console.error("Error loading Amtrak stations:", err);
      }
    };

    loadAmtrakStations();
  }, []);

  // Finds the closest amtrak station based on the user input
  const findAmtrakStation = async (locationName) => {
    if (!locationName || !locationName.trim() || allStations.length === 0) {
      console.log("Invalid location name or no stations available");
      return null;
    }

    try {
      // Extract city name from the location (assuming format like "City, State, Country")
      const cityMatch = locationName.match(/^([^,]+)/);
      const cityName = cityMatch ? cityMatch[1].trim() : locationName;

      // First try direct matching
      const directMatch = allStations.find(
        (station) =>
          (station.name &&
            station.name.toLowerCase().includes(cityName.toLowerCase())) ||
          (station.city &&
            station.city.toLowerCase().includes(cityName.toLowerCase()))
      );

      if (directMatch) {
        setAmtrakStationId(directMatch.code);
        setAmtrakStationName(directMatch.name);
        return directMatch.code;
      }

      // If no direct match, use Gemini API
      const prompt = `
      I need to find the closest matching Amtrak station for "${locationName}".
      Here's a list of all Amtrak stations:
      ${JSON.stringify(allStations.slice(0, 100))}
      
      Please respond with ONLY the station code (e.g., "NYP" for New York Penn Station).
      If there's no good match, respond with "NO_MATCH".
      Do not include any other text in your response.
      `;

      const response = await generateContent(prompt);
      const stationCode = response.trim();

      if (stationCode === "NO_MATCH") {
        console.log("No matching Amtrak station found");
        return null;
      }

      // Find the station details
      const matchedStation = allStations.find(
        (station) => station.code === stationCode
      );

      if (matchedStation) {
        setAmtrakStationId(matchedStation.code);
        setAmtrakStationName(matchedStation.name);
        return matchedStation.code;
      } else {
        console.log("Station code not found in database");
        return null;
      }
    } catch (err) {
      console.error("Error finding Amtrak station:", err);
      return null;
    }
  };

  // Load Google Maps script
  useEffect(() => {
    if (!window.google && !document.getElementById("google-maps-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (isScriptLoaded && locationInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        locationInputRef.current
      );

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setLocation(place.formatted_address);

          // Find corresponding Amtrak station
          await findAmtrakStation(place.formatted_address);

          // Test nearby search if we have coordinates
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            fetchNearbyPlaces(lat, lng);
          }
        }
      });
    }
  }, [isScriptLoaded]);

  const fetchNearbyPlaces = async (lat, lng) => {
    try {
      // For testing, we'll use a proxy or backend endpoint
      // In production, you should use a backend to make this request
      const proxyUrl = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=restaurant&key=${API_KEY}`;

      // Note: This direct API call will likely be blocked by CORS in the browser
      // You should implement this in your backend
      console.log(`Would fetch nearby places at: ${lat},${lng}`);

      // Simulating a successful response for testing
      setPlacesData({
        message: `Found restaurants near ${lat},${lng}`,
        note: "This is a simulation. In production, implement this call on your backend.",
      });
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If location is entered but no Amtrak station ID is set yet, try to find it
    if (location && !amtrakStationId) {
      await findAmtrakStation(location);
    }

    try {
      const response = await fetch(
        `https://api-v3.amtraker.com/v3/trains/${trainNumber}`
      );
      const data = await response.json();
      setTrainData(data);
    } catch (error) {
      console.error("Error fetching train data:", error);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold mb-[10px]">Welcome to Next Stop!</h1>
      <p className="text-xl mb-[30px]">
        Your go-to companion for entertainment during train delays.
      </p>

      <form
        className="w-[460px] flex flex-col justify-center gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          className="bg-gray-700 p-2 rounded-md text-white"
          value={trainNumber}
          placeholder="Enter your train number"
          onChange={(e) => setTrainNumber(e.target.value)}
        />

        <input
          ref={locationInputRef}
          type="text"
          className="bg-gray-700 p-2 rounded-md text-white"
          placeholder="Enter your location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <div className="flex justify-center"></div>
        <button
          type="submit"
          className="bg-blue-500 p-2 rounded-md text-white w-[100px]"
        >
          Submit
        </button>
      </form>

      {/*trainData && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Train Data:</h2>
          <pre className="bg-gray-800 p-4 rounded-md text-white overflow-auto max-h-60">
            {JSON.stringify(trainData, null, 2)}
          </pre>
        </div>
      )*/}
      {amtrakStationId && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Selected Amtrak Station:</h2>
          <div className="bg-gray-800 p-4 rounded-md text-white">
            <p>{amtrakStationName}</p>
            <p>
              Amtrak Station ID: <code>{amtrakStationId}</code>
            </p>
          </div>
        </div>
      )}

      {placesData && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Places API Test:</h2>
          <div className="bg-gray-800 p-4 rounded-md text-white">
            <p>{placesData.message}</p>
            <p className="text-yellow-300 text-sm mt-2">{placesData.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
