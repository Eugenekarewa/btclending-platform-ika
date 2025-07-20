
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ZkLoginTest from './pages/ZkLoginTest';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Test route (protected) */}
          <Route 
            path="/test" 
            element={
              <ProtectedRoute>
                <ZkLoginTest />
              </ProtectedRoute>
            } 
          />
          
          {/* Legacy route redirects */}
          <Route path="/Login" element={<Navigate to="/login" replace />} />
          <Route path="/Signup" element={<Navigate to="/signup" replace />} />
          <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;