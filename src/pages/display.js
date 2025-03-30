import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Train, Clock, AlertCircle, MapPin, Coffee, ListRestart as Restaurant, Library, Store, ArrowRight } from "lucide-react";

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
  const [interests, setInterests] = useState();
  const [selectedInterest, setSelectedInterest] = useState(null);

  const location = useLocation();
  const {
    trainNumber,
    amtrakStationId,
    location: userLocation,
    arrivalDelay,
    nearbyData
  } = location.state || {};

  console.log("Nearby Data:", nearbyData);

  const locationString = userLocation
    ? JSON.stringify(userLocation)
    : "No location available";



  const handleNextStep = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleInterestSubmit = (e) => {
    e.preventDefault();
    setShowNearbyPlaces(true);
    setShowInterestForm(false);
    setCurrentStep(1);
    sendRecommendationsPost();

  };
// Frontend: Display.jsx
const sendRecommendationsPost = async () => {
  try {
    console.log(nearbyData)
    console.log(interestText)
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nearbyData: nearbyData,
        interests: interestText
      })
    });
    const data = await response.json();
    console.log("Recommendations:", data.recommendations);
    setRecommendations(data.recommendations);
  } catch (error) {
    console.error('Error:', error);
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
                      <p className="text-2xl font-bold">{arrivalDelay} minutes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Clock className="h-5 w-5 mb-1" />
                    <p className="text-sm">Updated just now</p>
                  </div>
                </div>

                {/* Interest Form Button */}
                <div className="mt-6 border-t pt-6">
                  {!showInterestForm && !showNearbyPlaces && (
                    <button
                      onClick={() => setShowInterestForm(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MapPin className="h-5 w-5" />
                      <span>Explore Nearby Places</span>
                    </button>
                  )}

                  {/* Multi-step Interest Form */}
                  {showInterestForm && (
                    <div className="mt-4">
                      {/* Step indicator */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              currentStep === 1
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            1
                          </div>
                          <div className="w-12 h-1 mx-2 bg-blue-100"></div>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              currentStep === 2
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            2
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowInterestForm(false);
                            setCurrentStep(1);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>

                      {currentStep === 1 ? (
                        <form onSubmit={handleNextStep}>
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor="interests"
                                className="block text-lg font-medium text-gray-900 mb-2"
                              >
                                What are you interested in doing while you wait?
                              </label>
                              <textarea
                                id="interests"
                                value={interestText}
                                onChange={(e) => setInterestText(e.target.value)}
                                placeholder="E.g., I'd like to grab a coffee and maybe do some shopping..."
                                className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <span>Next</span>
                              <ArrowRight className="h-5 w-5" />
                            </button>
                          </div>
                        </form>
                      ) : (

                        <form onSubmit={handleInterestSubmit}>
                          <div className="space-y-4">
                            <p className="text-lg font-medium text-gray-900">
                              Select categories that match your interests:
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name="interest"
                                  value="coffee" // Value for coffee interest
                                  checked={selectedInterest === "coffee"} // Check if this is the selected one
                                  onChange={(e) => setSelectedInterest(e.target.value)} // Update the state with the selected value
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                                <div className="flex items-center space-x-2">
                                  <Coffee className="h-5 w-5 text-blue-600" />
                                  <span>Coffee Shops</span>
                                </div>
                              </label>

                              <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name="interest"
                                  value="restaurant" // Value for restaurant interest
                                  checked={selectedInterest === "restaurant"} // Check if this is the selected one
                                  onChange={(e) => setSelectedInterest(e.target.value)} // Update the state with the selected value
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                                <div className="flex items-center space-x-2">
                                  <Restaurant className="h-5 w-5 text-blue-600" />
                                  <span>Restaurants</span>
                                </div>
                              </label>

                              <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name="interest"
                                  value="shopping" // Value for shopping interest
                                  checked={selectedInterest === "shopping"} // Check if this is the selected one
                                  onChange={(e) => setSelectedInterest(e.target.value)} // Update the state with the selected value
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                                <div className="flex items-center space-x-2">
                                  <Store className="h-5 w-5 text-blue-600" />
                                  <span>Shopping</span>
                                </div>
                              </label>

                              <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name="interest"
                                  value="activities" // Value for activities interest
                                  checked={selectedInterest === "activities"} // Check if this is the selected one
                                  onChange={(e) => setSelectedInterest(e.target.value)} // Update the state with the selected value
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                                <div className="flex items-center space-x-2">
                                  <Library className="h-5 w-5 text-blue-600" />
                                  <span>Activities</span>
                                </div>
                              </label>
                            </div>

                            <div className="flex space-x-4">
                              <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Back
                              </button>
                              <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Show Me Places
                              </button>
                            </div>
                          </div>
                        </form>

                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Places */}
          {showNearbyPlaces && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold">Places Nearby</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {recommendations.map((place, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                      {place.type === "coffee" && <Coffee className="h-5 w-5" />}
                      {place.type === "restaurant" && (
                        <Restaurant className="h-5 w-5" />
                      )}
                      {place.type === "library" && (
                        <Library className="h-5 w-5" />
                      )}
                    </div>
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
                      <span className="text-sm text-gray-600">
                        {place.reason}
                      </span>
                    </div>
                    <div
                      className={`text-sm ${
                        place.isOpen ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {place.isOpen ? "Open" : "Closed"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}