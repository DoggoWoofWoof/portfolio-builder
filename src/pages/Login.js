// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isSignup, setIsSignup] = useState(true); // State to toggle between signup and login
  const [errorMessage, setErrorMessage] = useState(''); // To store error messages
  const [isSubmitting, setIsSubmitting] = useState(false); // To manage loading state
  const navigate = useNavigate(); // Get navigate for redirection

  // Check if the user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn'); // Check local storage or your auth state
    if (isLoggedIn) {
      navigate('/resume'); // Redirect to resume if already logged in
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage(''); // Clear any previous error message
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup && formData.password !== formData.confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
    }

    setIsSubmitting(true); // Start the loading state
    try {
        const endpoint = isSignup 
            ? 'http://localhost:5000/api/users/signup' 
            : 'http://localhost:5000/api/users/login'; // Change the endpoint based on state
        
        const response = await axios.post(endpoint, formData); // Full URL
        alert(`${isSignup ? "Signup" : "Login"} successful`);

        // Set user status and ID in local storage and navigate to resume
        if (response.data.userId) {
            localStorage.setItem('isLoggedIn', 'true'); // Set logged in status
            localStorage.setItem('userId', response.data.userId); // Store the user ID
            navigate('/resume'); // Redirect to resume
        }

        // Reset form data after successful submission
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        });

    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            setErrorMessage(error.response.data.error); // Display specific error message from the server
        } else {
            setErrorMessage("An unexpected error occurred during signup/login");
        }
    } finally {
        setIsSubmitting(false); // End the loading state
    }
};   

  const toggleForm = () => {
    setIsSignup(!isSignup); // Toggle between signup and login
    setErrorMessage(''); // Clear error message on toggle
  };

  return (
    <div className="signup-container">
      <h2 className="title">{isSignup ? "SIGN UP" : "LOGIN"}</h2>
      <p>{isSignup ? "Sign up to build the perfect resume." : "Log in to access your account."}</p>
      <form className="signup-form" onSubmit={handleSubmit}>
        {isSignup && (
          <>
            <label>First Name*</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />

            <label>Last Name*</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </>
        )}

        <label>Email*</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Password*</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        {isSignup && (
          <>
            <label>Confirm Password*</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </>
        )}

        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? `${isSignup ? "Signing up..." : "Logging in..."}` : "Submit"}
        </button>

        <p>
          {isSignup ? "Already have an account?" : "Don't have an account?"} 
          <button type="button" onClick={toggleForm}>
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
