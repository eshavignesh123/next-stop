import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';


// Google Generative AI Model Setup
const genAI = new GoogleGenerativeAI("AIzaSyBC6zLbOgNvOIZz0O1gmvnDeel5z7gSiKU");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Utility Functions
const fetchAllStationsDirectly = async () => {
  try {
    const response = await fetch("https://api-v3.amtraker.com/v3/stations");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const stations = await response.json();
    return stations;
  } catch (error) {
    console.error("Error fetching stations:", error);
    throw error;
  }
};

const generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    return null;
  }
};

// App Component
function Home() {
  // State variables
  const [trainNumber, setTrainNumber] = useState("");
  const [location, setLocation] = useState("");
  const [trainData, setTrainData] = useState(null);
  const [placesData, setPlacesData] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [amtrakStationId, setAmtrakStationId] = useState("");
  const [amtrakStationName, setAmtrakStationName] = useState("");
  const [allStations, setAllStations] = useState([]);

  const locationInputRef = useRef(null);
  const API_KEY = process.env.REACT_APP_MAPS_API_KEY;
  const navigate = useNavigate();


  // Fetch All Amtrak Stations
  useEffect(() => {
    const loadAmtrakStations = async () => {
      try {
        const stations = await fetchAllStationsDirectly();
        const stationsArray = Object.entries(stations).map(([code, details]) => ({
          code,
          name: details.name,
          city: details.city,
          state: details.state,
        }));
        setAllStations(stationsArray);
      } catch (err) {
        console.error("Error loading Amtrak stations:", err);
      }
    };

    loadAmtrakStations();
  }, []);

  // Find Closest Amtrak Station
  const findAmtrakStation = async (locationName) => {
    if (!locationName || !locationName.trim() || allStations.length === 0) {
      console.log("Invalid location name or no stations available");
      return null;
    }

    try {
      console.log("Finding Amtrak station for:", locationName);

      // Generate prompt for Gemini AI to find the closest matching station
      const prompt = `
        I need to find the closest matching Amtrak station for "${locationName}".
        Here's a list of all Amtrak stations:
        
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

      // Find and set the station details
      const matchedStation = allStations.find((station) => station.code === stationCode);
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

  // Load Google Maps Script
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
  }, [API_KEY]);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (isScriptLoaded && locationInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
        types: ['train_station'], // Restrict to train stations only
      });

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setLocation(place.formatted_address);

          // Find corresponding Amtrak station
          await findAmtrakStation(place.formatted_address);

          // Fetch nearby places if coordinates are available
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            fetchNearbyPlaces(lat, lng);
          }
        }
      });
    }
  }, [isScriptLoaded]);

  // Fetch Nearby Places (e.g., restaurants)
  const fetchNearbyPlaces = async (lat, lng) => {
    try {
      const proxyUrl = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=restaurant&key=${API_KEY}`;
      console.log(`Would fetch nearby places at: ${lat},${lng}`);
      setPlacesData({
        message: `Found restaurants near ${lat},${lng}`,
        note: "This is a simulation. In production, implement this call on your backend.",
      });
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If location is entered but no Amtrak station ID is set yet, try to find it
    if (location && !amtrakStationId) {
      await findAmtrakStation(location);
    }

    try {
      const response = await fetch(`https://api-v3.amtraker.com/v3/trains/${trainNumber}`);
      const data = await response.json();
      setTrainData(data);
    } catch (error) {
      console.error("Error fetching train data:", error);
    }

    navigate("/display");

  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold mb-[10px]">Welcome to Next Stop!</h1>
      <p className="text-xl mb-[30px]">
        Your go-to companion for entertainment during train delays.
      </p>

      {/* Form to Enter Train Details */}
      <form className="w-[460px] flex flex-col justify-center gap-4" onSubmit={handleSubmit}>
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

        <div className="flex justify-center">
          <button type="submit" className="bg-blue-500 p-2 rounded-md text-white w-[100px]">
            Submit
          </button>
        </div>
      </form>

      {/* Display Selected Amtrak Station */}
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

      {/* Display Places Data */}
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

export default Home;
