import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import Signup from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ActiveSession from './components/ActiveSession';
import SessionLog from './components/SessionLog';
import Profile from './components/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="app">
          <Header />
          <HeroSection />
          <Footer />
        </div>
      } />
      
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/active-session" element={<ActiveSession />} />
      <Route path="/session-log" element={<SessionLog />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;