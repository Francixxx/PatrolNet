import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './components/Login';
import About from "./components/About";
import IncidentReport from "./components/Incident_Report";
import ScheduleAssignment from './components/ScheduleAssignment';
import PatrolLogs from "./components/Patrollogs";
import Accounts from "./components/Accounts";
import GISMapping from "./components/GISmapping";
import User from "./components/User"; // Make sure this exists
import "./App.css";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");
    if (loggedIn) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserRole(userData.userRole);
    setShowLogin(false);
    localStorage.setItem("isLoggedIn", true);
    localStorage.setItem("userRole", userData.userRole);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("");
    setShowLogin(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
  };

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="left">
            <img src="logo.png" alt="Logo" className="logo" />
            <h1>PatrolNet</h1>
          </div>
          <div className="right">
            {!isLoggedIn ? (
              <button className="login-btn1" onClick={() => setShowLogin(true)}>
                Log in
              </button>
            ) : (
              <button className="login-btn1" onClick={handleLogout}>
                Log out
              </button>
            )}
          </div>
        </header>

        {/* Show content if not logged in */}
        {!isLoggedIn && !showLogin && (
          <>
            <main className="hero">
              <div className="overlay">
                <h2>Welcome to Barangay Tanod Patrol Optimization System</h2>
                <p>Optimizing Safety & Community Engagement</p>
                <button className="login-btn1" onClick={() => setShowLogin(true)}>
                  Get Started
                </button>
              </div>
            </main>
            <About />
          </>
        )}

        {/* Show Login form */}
        {showLogin && (
          <Login setShowLogin={setShowLogin} onLoginSuccess={handleLoginSuccess} />
        )}

        {/* If logged in, render routes */}
        {isLoggedIn && (
          <Routes>
            {/* Tanod & Resident → always go to User */}
            {(userRole === "Tanod" || userRole === "Resident") && (
              <>
                <Route path="/user" element={<User />} />
                <Route path="*" element={<Navigate to="/user" replace />} />
              </>
            )}

            {/* Other roles */}
            {!(userRole === "Tanod" || userRole === "Resident") && (
              <>
                <Route path="/incident-report" element={<IncidentReport />} />
                <Route path="/scheduling" element={<ScheduleAssignment />} />
                <Route path="/patrol-logs" element={<PatrolLogs />} />
                <Route path="/Accounts" element={<Accounts />} />
                <Route path="/gis-mapping" element={<GISMapping />} />
                <Route path="*" element={<Navigate to="/incident-report" replace />} />
              </>
            )}
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;