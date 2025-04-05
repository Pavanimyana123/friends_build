import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Images/logo.jpeg";
import jewelleryImage from "../Images/login_banner.jpg";
import './Login.css';
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import baseURL from '../../../Url/NodeBaseURL';
import { AuthContext } from "../../AuthContext/ContextApi"; // Import context

function Login() {
  const { login } = useContext(AuthContext); // Use login function from context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Static Admin Login
    if (email === "admin@gmail.com" && password === "admin@123") {
      login({ email, account_group: "ADMIN", account_name: "Admin" });
      navigate("/a-dashboard");
      return;
    }

    // Dynamic Customer/Worker Login via API
    try {
      const response = await axios.post(`${baseURL}/login`, { email, password });

      if (response.status === 200) {
        const userData = response.data.user;
        login(userData); // Update user state immediately

        if (userData.account_group === "CUSTOMERS") {
          navigate("/c-dashboard");
        } else if (userData.account_group === "WORKER") {
          navigate("/w-dashboard");
        } else {
          alert("Unauthorized access");
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid Credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left Side - Jewellery Image */}
        <div className="login-image">
          <img src={jewelleryImage} alt="Login Banner" />
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form">
          <div className="login-form-container">
            {/* Logo */}
            <div className="text-center mb-3">
              <img src={logo} alt="Logo" className="login-logo" />
            </div>
            <h3 className="text-center mb-4">Login</h3>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="login-form-control"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password:</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              <button type="submit" className="btn btn-login">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
