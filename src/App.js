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
        <input
          type="text"
          className="bg-gray-700 p-2 rounded-md text-white"
          placeholder='Enter your location'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button type="submit" className="bg-blue-500 p-2 rounded-md text-white w-[100px]">
          Submit
        </button>
      </form>
      
      {/*trainData && (
        <div>
          <h2>Train Data:</h2>
          <pre>{JSON.stringify(trainData, null, 2)}</pre>
        </div>
      )*/}
    </div>
  );
}

export default App;
