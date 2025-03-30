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
  const location = useLocation();
  const {
    trainNumber,
    amtrakStationId,
    location: userLocation,
    delayMinutes,
  } = location.state || {};

  // Convert the userLocation object to a string (assuming it might be an object)
  const locationString = userLocation
    ? JSON.stringify(userLocation)
    : "No location available";

  // Example delay info and nearby places data (you should replace these with real data)

  console.log(delayMinutes);

  const delayInfo = {
    severity: "high",
    minutes: delayMinutes,
    reason: "Signal issues",
  };
  const nearbyPlaces = [
    {
      name: "Coffee Shop",
      type: "coffee",
      distance: "200 meters",
      rating: 4,
      isOpen: true,
    },
    {
      name: "Restaurant",
      type: "restaurant",
      distance: "500 meters",
      rating: 3,
      isOpen: false,
    },
    {
      name: "Library",
      type: "library",
      distance: "1 km",
      rating: 5,
      isOpen: true,
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-100 border-red-400";
      case "medium":
        return "bg-yellow-100 border-yellow-400";
      case "low":
        return "bg-green-100 border-green-400";
      default:
        return "bg-gray-100 border-gray-400";
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
              <div
                className={`rounded-xl border p-6 ${getSeverityColor(
                  delayInfo.severity
                )}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-white/80">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">
                      Current Delay Status
                    </h2>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">
                        {delayInfo.minutes} minutes
                      </p>
                      <p className="text-sm opacity-90">{delayInfo.reason}</p>
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
