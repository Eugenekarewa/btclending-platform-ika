
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ZkLoginTest from './pages/ZkLoginTest';
import './index.css';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'signup'>('home');

  const handleSwitchToLogin = () => setCurrentView('login');
  const handleSwitchToSignup = () => setCurrentView('signup');
  const handleBackToHome = () => setCurrentView('home');

  // For non-router navigation (if needed)
  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login 
            onSwitchToSignup={handleSwitchToSignup}
            onBackToHome={handleBackToHome}
          />
        );
      case 'signup':
        return (
          <Signup 
            onSwitchToLogin={handleSwitchToLogin}
            onBackToHome={handleBackToHome}
          />
        );
      default:
        return <Home />;
    }
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/Login" 
            element={
              <Login 
                onSwitchToSignup={handleSwitchToSignup}
                onBackToHome={handleBackToHome}
              />
            } 
          />
          <Route 
            path="/Signup" 
            element={
              <Signup 
                onSwitchToLogin={handleSwitchToLogin}
                onBackToHome={handleBackToHome}
              />
            } 
          />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/test" element={<ZkLoginTest />} />
          
          {/* Fallback for non-router navigation */}
          <Route path="/app" element={renderCurrentView()} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;