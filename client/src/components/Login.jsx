import React, { useState } from "react";
import "./Login.css";
import { FaArrowLeft, FaUser, FaLock } from "react-icons/fa";
import axios from "axios";

const Login = ({ setShowLogin, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    if (!username || !password) {
      setMessage("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://192.168.100.3:3001/login", {
        username,
        password,
        clientType: 'web'
      });

      setMessage(res.data.message);

      if (res.data.success) {
        const userRole = res.data.user?.role || res.data.user?.ROLE;
        
        if (userRole !== 'Admin') {
          setMessage("Access denied. Only Admin users are allowed to login.");
          setLoading(false);
          return;
        }

        const userData = {
          username: username,
          userRole: userRole,
          userId: res.data.user.id,
          userName: res.data.user.name,
          userEmail: res.data.user.email,
          userAddress: res.data.user.address,
          userStatus: res.data.user.status,
          userImage: res.data.user.image
        };

        console.log('Login successful, user data:', userData);
        onLoginSuccess(userData);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setMessage(err.response.data.error || "Access denied");
      } else if (err.response?.status === 401) {
        setMessage("Invalid username or password");
      } else if (err.response?.status === 400) {
        setMessage(err.response.data.error || "Please check your input");
      } else {
        setMessage(err.response?.data?.error || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <button className="back-button" onClick={() => setShowLogin(false)}>
            <FaArrowLeft />
          </button>
          <h2>Admin Portal</h2>
        </div>
        
          <div className="login-avatar">
          <div className="avatar-circle">
            <img 
              src="/logo.jpg" 
              alt="Admin Avatar" 
              className="avatar-image"
            />
          </div>
        </div>
        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            placeholder="Username"
            className="login-input"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setMessage("");
            }}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMessage("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button 
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          className={`login-button ${loading ? 'loading' : ''}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner"></span>
          ) : (
            "Sign In"
          )}
        </button>

        {message && (
          <div className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <div className="login-footer">
          <a href="#forgot" className="forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;