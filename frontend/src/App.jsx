import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ActiveSession from './components/ActiveSession';
import SessionLog from './components/SessionLog';
import Profile from './components/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ActiveSession />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/dashboard" element={<Dashboard />} />
      
      <Route path="/session-log" element={<SessionLog />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;