import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from "react-router-dom";
import { Train, MapPin, Search, ArrowRight } from "lucide-react";

// Google Generative AI Model Setup
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
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
  const [delayData, setDelayData] = useState(null);

  const locationInputRef = useRef(null);
  const API_KEY = process.env.REACT_APP_MAPS_API_KEY;
  const navigate = useNavigate();

  // Function to calculate train delay at a specific station
  const getTrainDelay = async (trainNumber, stationId) => {
    if (!trainNumber || !stationId) {
      console.log("Train number and station ID are required");
      return null;
    }

    try {
      // Fetch train data
      const response = await fetch(
        `https://api-v3.amtraker.com/v3/trains/${trainNumber}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const trainData = await response.json();

      // Check if train exists
      if (!trainData || Object.keys(trainData).length === 0) {
        console.log(`No data found for train ${trainNumber}`);
        return null;
      }

      // Get the train object (first element in the array)
      const train = trainData[trainNumber][0];

      // Find the station in the train's stations array
      const stationInfo = train.stations.find(
        (station) => station.code === stationId
      );

      console.log("Station: " + JSON.stringify(stationInfo));

      if (!stationInfo) {
        console.log(
          `Station ${amtrakStationId} not found for train ${trainNumber}`
        );
        return null;
      }

      console.log(JSON.stringify(stationInfo.schArr));
      // Calculate arrival delay
      let arrivalDelay = null;
      if (stationInfo.schArr && stationInfo.arr) {
        const scheduledArrival = new Date(stationInfo.schArr);
        console.log("SCHARV" + scheduledArrival);
        const estimatedArrival = new Date(stationInfo.arr);
        console.log("ESTARV" + estimatedArrival);
        arrivalDelay = Math.round(
          (estimatedArrival - scheduledArrival) / 60000
        ); // Convert to minutes
      }

      // Return the delay information
      return {
        trainNumber,
        stationId,
        stationName: stationInfo.name || amtrakStationName,
        arrivalDelay, // Gives the minutes train is delayed for.
        arrivalComment: stationInfo.arrCmnt || null,
        departureComment: stationInfo.depCmnt || null,
        scheduledArrival: stationInfo.schArr
          ? new Date(stationInfo.schArr).toLocaleTimeString()
          : null,
        estimatedArrival: stationInfo.arr
          ? new Date(stationInfo.arr).toLocaleTimeString()
          : null,
      };
    } catch (error) {
      console.error("Error calculating train delay:", error);
      return null;
    }
  };

  // Fetch All Amtrak Stations
  useEffect(() => {
    const loadAmtrakStations = async () => {
      try {
        const stations = await fetchAllStationsDirectly();
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
      const autocomplete = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ["train_station"], // Restrict to train stations only
        }
      );

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

    if (trainNumber && amtrakStationId) {
      try {
        // Get train data
        const response = await fetch(
          `https://api-v3.amtraker.com/v3/trains/${trainNumber}`
        );
        const data = await response.json();
        setTrainData(data);

        // Get delay information
        const delayInfo = await getTrainDelay(trainNumber, amtrakStationId);

        // Set delay information in state
        if (delayInfo) {
          setDelayData(delayInfo);
        }
      } catch (error) {
        console.error("Error fetching train data:", error);
      }
    }

    navigate("/display", { state: { trainNumber, amtrakStationId, location } });

    // If using react-router, navigate to display page
    // navigate("/display");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="min-h-screen flex items-center container mx-auto px-4 py-12 ">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section with Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative bg-blue-600 text-white px-8 py-12">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <Train className="w-full h-full" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Welcome to Next Stop!
              </h1>
              <p className="text-xl text-blue-100">
                Your go-to companion for entertainment during train delays.
              </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Train className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors bg-gray-50 text-gray-900"
                      placeholder="Enter your train number"
                      value={trainNumber}
                      onChange={(e) => setTrainNumber(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      ref={locationInputRef}
                      type="text"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors bg-gray-50 text-gray-900"
                      placeholder="Enter your location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="group relative bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>Find Entertainment</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </form>

              {/* Results Section */}
              {(amtrakStationId || placesData) && (
                <div className="mt-8 space-y-6">
                  {amtrakStationId && (
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                      <h2 className="text-xl font-semibold text-blue-900 mb-4">
                        Selected Station
                      </h2>
                      <div className="space-y-2">
                        <p className="text-blue-800 font-medium">
                          {amtrakStationName}
                        </p>
                        <p className="text-blue-600 text-sm">
                          Station ID:{" "}
                          <code className="bg-blue-100 px-2 py-1 rounded">
                            {amtrakStationId}
                          </code>
                        </p>
                      </div>
                    </div>
                  )}

                  {placesData && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Nearby Places
                      </h2>
                      <div className="space-y-2">
                        <p className="text-gray-800">{placesData.message}</p>
                        <p className="text-amber-600 text-sm">
                          {placesData.note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
