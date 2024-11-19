import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  useEffect(() => {
    // This can be used to set initial state or perform side effects
    // If you're using any state that might change based on navigation
  }, [isLoggedIn]); // Dependency array to prevent infinite loop

  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">IDEATE. DESIGN. CREATE.</div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        {isLoggedIn ? (
          <>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login/Signup</Link>
        )}
        <div 
          className="navbar-dropdown" 
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave}
        >
          <a href="#more">More</a>
          {showDropdown && (
            <div className="dropdown-content">
              <Link to="/resume">Resume Builder</Link>
              <Link to="/templates">Templates</Link>
              <Link to="/contact">Contact</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
