import logo from './logo.svg';
import './App.css';

function App() {


  return (
    <div className=" flex flex-col justify-center items-center">
      <form className="w-[860px] h-[550px] flex flex-col gap-4">
        <label className="text-black" >Enter your train number:</label>
        <input type="text" className="bg-gray-700 p-2 rounded-md" />
        <label className="text-black">Enter your location:</label>
        <input type="text" className="bg-gray-700 p-2 rounded-md" />
        <button type="submit" className="bg-blue-500 p-2 rounded-md text-white">Submit</button>
      </form>
  </div>
  );
}

export default App;
