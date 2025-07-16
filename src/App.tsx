
import React from 'react';
import { BrowserRouter,Routes, Route } from 'react-router-dom';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import Home from './pages/Home';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

    </Routes>
    </BrowserRouter>

    
  );
};

export default App;