import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home'; // Import your main component
import Display from './display'; // Import the page you want to redirect to

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/display" element={<Display />} />
      </Routes>
    </Router>
  );
}

export default Main;
