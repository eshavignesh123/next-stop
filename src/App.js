import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [trainNumber, setTrainNumber] = useState('');
  const [location, setLocation] = useState('');
  const [trainData, setTrainData] = useState(null);
  const [placesData, setPlacesData] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const API_KEY = 'AIzaSyAJKdEwkvfjh4alllwzW3HL0O-wc3PAl1o'; // Replace with your actual API key

  // Load Google Maps script
  useEffect(() => {
    if (!window.google && !document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
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
      const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current);
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setLocation(place.formatted_address);
          
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
        note: "This is a simulation. In production, implement this call on your backend."
      });
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://api-v3.amtraker.com/v3/trains/${trainNumber}`);
      const data = await response.json();
      setTrainData(data);
    } catch (error) {
      console.error('Error fetching train data:', error);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center">
      <h1 className = "text-6xl font-bold mb-[10px]">Welcome to Next Stop!</h1>
      <p className = "text-xl mb-[30px]">Your go-to companion for entertainment during train delays.</p>

      <form
        className="w-[460px] flex flex-col justify-center gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          className="bg-gray-700 p-2 rounded-md text-white"
          value={trainNumber}
          placeholder='Enter your train number'

          onChange={(e) => setTrainNumber(e.target.value)}
        />
        
        <label className="text-black">Enter your location:</label>
        <input
          ref={locationInputRef}
          type="text"
          className="bg-gray-700 p-2 rounded-md text-white"
          placeholder='Enter your location'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <div className= "flex justify-center">
        </div>
        <button type="submit" className="bg-blue-500 p-2 rounded-md text-white w-[100px]">
          Submit
        </button>
      </form>
      
      {trainData && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Train Data:</h2>
          <pre className="bg-gray-800 p-4 rounded-md text-white overflow-auto max-h-60">
            {JSON.stringify(trainData, null, 2)}
          </pre>
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


