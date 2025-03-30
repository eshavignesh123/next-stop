import React from "react";
import { useLocation } from "react-router-dom";
import {
  Train,
  Clock,
  AlertCircle,
  MapPin,
  Coffee,
  Restaurant,
  Library,
  Store,
} from "lucide-react";

export default function Display() {
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [interestText, setInterestText] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [typeInterests, setTypeInterests] = useState({
    coffee: false,
    food: false,
    shopping: false,
    activities: false,
  });
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [nearbyData, setNearbyData] = useState([]);

  const location = useLocation();
  const {
    trainNumber,
    amtrakStationId,
    location: userLocation,
    arrivalDelay,
    latitude,
    longitude,
  } = location.state || {};

  // Convert the userLocation object to a string (assuming it might be an object)
  const locationString = userLocation
    ? JSON.stringify(userLocation)
    : "No location available";

  const handleNextStep = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  // Modified fetchNearbyPlaces to return the data
  const fetchNearbyPlaces = async (
    lat,
    lng,
    radius = 1000,
    type = selectedInterest
  ) => {
    try {
      console.log(
        `Fetching nearby places for lat=${lat}, lng=${lng}, radius=${radius}, type=${type}`
      );
      const response = await fetch(
        `/api/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`
      );

      if (!response.ok) throw new Error("Fetch failed");

      const data = await response.json();
      setNearbyData(data.results); // Update state for UI
      return data.results; // Return directly for immediate use
    } catch (error) {
      console.error("Fetch error:", error);
      throw error; // Re-throw for handling in caller
    }
  };

  // Updated submission handler with proper async flow
  const handleInterestSubmit = async (e) => {
    e.preventDefault();

    try {
      // Fetch first and await completion
      const places = await fetchNearbyPlaces(latitude, longitude);

      // Update UI states after successful fetch
      setShowNearbyPlaces(true);
      setShowInterestForm(false);

      // Pass fetched data directly instead of state
      await sendRecommendationsPost(places, interestText);
    } catch (error) {
      console.error("Submission failed:", error);
      // Add error state handling here
    }
  };

  // Modified recommendation sender
  const sendRecommendationsPost = async (places, interests) => {
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nearbyData: places, // Use passed argument
          interests: interests,
        }),
      });

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Recommendation error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative bg-blue-600 text-white px-8 py-12">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <Train className="w-full h-full" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <Train className="h-8 w-8" />
                  <h1 className="text-3xl font-bold">Train Status</h1>
                </div>
                <div className="grid md:grid-cols-3 gap-6 text-blue-100">
                  <div>
                    <p className="text-sm uppercase">Train Number</p>
                    <p className="text-xl font-semibold text-white">
                      {trainNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm uppercase">Station ID</p>
                    <p className="text-xl font-semibold text-white">
                      {amtrakStationId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm uppercase">Location</p>
                    <p className="text-xl font-semibold text-white">
                      {locationString}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delay Information */}
            <div className="p-8">
              <div className="rounded-xl border p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-white/80">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">
                      Current Delay Status
                    </h2>
                    <div className="space-y-2">
                      {arrivalDelay < 0 ? (
                        <p className="text-2xl font-bold text-green-600">
                          {Math.abs(arrivalDelay)} minutes early
                        </p>
                      ) : arrivalDelay > 0 ? (
                        <p className="text-2xl font-bold text-red-600">
                          {arrivalDelay} minutes delayed
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-blue-600">
                          On time
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Clock className="h-5 w-5 mb-1" />
                    <p className="text-sm">Updated just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Places */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Places Nearby</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {nearbyPlaces.map((place, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4"></div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{place.name}</h3>
                      <p className="text-sm text-gray-600">{place.distance}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.floor(place.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          {place.rating}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-sm ${
                        place.isOpen ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {place.isOpen ? "Open" : "Closed"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
