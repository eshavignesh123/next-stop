import React, { useState } from 'react';

function App() {
  const [trainNumber, setTrainNumber] = useState('');
  const [location, setLocation] = useState('');
  const [trainData, setTrainData] = useState(null);

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
    <div className="flex flex-col justify-center items-center">
      <form
        className="w-[860px] h-[550px] flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <label className="text-black">Enter your train number:</label>
        <input
          type="text"
          className="bg-gray-700 p-2 rounded-md"
          value={trainNumber}
          onChange={(e) => setTrainNumber(e.target.value)}
        />
        <label className="text-black">Enter your location:</label>
        <input
          type="text"
          className="bg-gray-700 p-2 rounded-md"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 p-2 rounded-md text-white">
          Submit
        </button>
      </form>
      {trainData && (
        <div>
          <h2>Train Data:</h2>
          <pre>{JSON.stringify(trainData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
