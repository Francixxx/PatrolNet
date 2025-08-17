import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import Login from './components/Login';
import About from "./components/About";
import IncidentReport from "./components/Incident_Report";
import ScheduleAssignment from './components/ScheduleAssignment';
import PatrolLogs from "./components/Patrollogs";
import Accounts from "./components/Accounts";
import GISMapping from "./components/GISmapping";
import User from "./components/User";
import "./App.css";
import Landingpage from "./Landingpage.jsx";
import Contact from "./components/Contact";
import AdminActivities from "./components/AdminActivities";
import Dashboard from "./components/Dashboard.jsx";
import AdminAnnouncements from "./components/AdminAnnouncements";

// ✅ New components for Activities & Announcements
import Activities from "./components/Activities";
import Announcements from "./components/Announcements";

// Create a wrapper component to access navigate
function AppContent() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false); // ✅ New loading state

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");
    if (loggedIn === "true") { // ✅ Check for string "true"
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserRole(userData.userRole);
    setShowLogin(false);
    localStorage.setItem("isLoggedIn", "true"); // ✅ Store as string
    localStorage.setItem("userRole", userData.userRole);
    
    // ✅ Navigate to appropriate dashboard after login
    if (userData.userRole === "Tanod" || userData.userRole === "Resident") {
      navigate("/user");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    console.log("🔴 Logout initiated..."); // ✅ Debug log
    
    // ✅ Set loading state
    setIsLoggingOut(true);
    
    // ✅ Simulate logout process (you can replace this with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // ✅ Clear all state
    setIsLoggedIn(false);
    setUserRole("");
    setShowLogin(false);
    setIsLoggingOut(false);
    
    // ✅ Clear localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    
    console.log("🔴 State cleared, navigating to home..."); // ✅ Debug log
    
    // ✅ Navigate to landing page after logout
    navigate("/", { replace: true });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="left">
          <img src="logo.png" alt="Logo" className="logo" />
          <h1>PatrolNet</h1>
        </div>
        <div className="right">
          {!isLoggedIn && (
            <>
              <NavLink to="/" className="nav-link">Home</NavLink>
              <NavLink to="/about" className="nav-link">About Us</NavLink>
              <NavLink to="/activities" className="nav-link">Activities</NavLink>
              <NavLink to="/announcements" className="nav-link">Announcements</NavLink>
              <NavLink to="/contact" className="nav-link">Contact</NavLink>
              <button className="login-btn1" onClick={() => setShowLogin(true)}>
                Log in
              </button>
            </>
          )}
          {/* ✅ Show user role and logout for logged in users */}
          {isLoggedIn && (
            <div className="user-info">
              <span className="user-role">Logged in as: {userRole}</span>
              <button 
                className={`logout-btn ${isLoggingOut ? 'loading' : ''}`}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className="spinner"></span>
                    Logging out...
                  </>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Guest routes */}
      {!isLoggedIn && !showLogin && (
        <Routes>
          <Route path="/" element={<Landingpage onLoginClick={() => setShowLogin(true)} />} />
          <Route path="/about" element={<About />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/contact" element={<Contact />} />
          {/* ✅ Redirect any other routes to home when not logged in */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}

      {/* Show Login form */}
      {showLogin && (
        <Login setShowLogin={setShowLogin} onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Logged in routes */}
      {isLoggedIn && (
        <Routes>
          {(userRole === "Tanod" || userRole === "Resident") && (
            <>
              <Route path="/user" element={<User onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/user" replace />} />
            </>
          )}

          {!(userRole === "Tanod" || userRole === "Resident") && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/incident-report" element={<IncidentReport />} />
              <Route path="/scheduling" element={<ScheduleAssignment />} />
              <Route path="/patrol-logs" element={<PatrolLogs />} />
              <Route path="/Accounts" element={<Accounts />} />
              <Route path="/gis-mapping" element={<GISMapping />} />
              <Route path="/activities" element={<AdminActivities />} />
              <Route path="/admin-announcements" element={<AdminAnnouncements />} />
              <Route path="*" element={<Navigate to="/incident-report" replace />} />
            </>
          )}
        </Routes>
      )}
    </div>
  );
}

// Main App component with Router wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;