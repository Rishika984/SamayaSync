import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ActiveSession from "./components/ActiveSession";
import SessionLog from "./components/SessionLog";
import Profile from "./components/Profile";
import AuthSuccess from "./components/auth-success";

const NO_DARK_ROUTES = ["/welcome", "/signup", "/login"];

function App() {
  const location = useLocation();

  const disableDarkMode = NO_DARK_ROUTES.includes(location.pathname);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    // 🚫 Force light mode on selected routes
    if (disableDarkMode) {
      document.body.classList.remove("dark");
      return;
    }

    // ✅ Normal dark mode handling
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode, disableDarkMode]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ActiveSession
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        }
      />

      <Route path="/welcome" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <Dashboard
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        }
      />

      <Route
        path="/session-log"
        element={
          <SessionLog
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        }
      />

      <Route
        path="/profile"
        element={
          <Profile
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        }
      />

      <Route path="/auth-success" element={<AuthSuccess />} />
    </Routes>
  );
}

export default App;
