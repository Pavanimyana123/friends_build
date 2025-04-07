import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import baseURL from '../../../Url/NodeBaseURL';
import './OTPVerification.css';

function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (location.state) {
      setEmail(location.state.email);
      setFormData(location.state.formData);
    } else {
      // Redirect back if no form data
      navigate('/c-register');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);


  const handleVerifyOTP = async () => {
    setIsVerifying(true); // Disable button and show "Verifying..."

    try {
      console.log("Verifying OTP for:", { email, otp });

      const response = await axios.post(`${baseURL}/api/verify-otp`, { email, otp });

      if (response.status === 200) {
        console.log("OTP verified, proceeding with registration");
        console.log("Sending form data:", formData);

        const registerResponse = await axios.post(`${baseURL}/add-account`, formData);

        console.log("Registration response:", registerResponse);

        if (registerResponse.status === 200 || registerResponse.status === 201) {
          alert("Registration successful!");
          setTimeout(() => {
            navigate("/");
          }, 100);
        }
      }
    } catch (error) {
      if (error.response) {
        console.error("Verification failed:", error.response.data);
        setError(error.response.data.message || "Invalid OTP. Please try again.");
      } else {
        console.error("Error:", error.message);
        setError("Network error. Please try again.");
      }
    } finally {
      setIsVerifying(false); // Re-enable button after API response
    }
  };



  const handleResendOTP = async () => {
    try {
      const response = await axios.post(`${baseURL}/api/send-otp`, { email });
      if (response.status === 200) {
        setCountdown(60);
        setError("");
        alert("OTP resent successfully!");
      }
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-card">
        <h2>Verify Your Email Address</h2>
        <p>We've sent an OTP to {email}</p>

        <div className="otp-input-group">
          <label>Enter 6-digit OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            placeholder="123456"
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <button className="verify-button" onClick={handleVerifyOTP} disabled={isVerifying}>
          {isVerifying ? "Verifying..." : "Verify"}
        </button>


        <div className="resend-otp">
          <p>Didn't receive OTP?</p>
          <button
            onClick={handleResendOTP}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;