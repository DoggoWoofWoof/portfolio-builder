// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ResumeBuilder from "./pages/ResumeBuilder";
import Templates from "./pages/Templates";
import profileImg from "./assets/profile-image.jpeg";
import TemplatePreview from "./pages/TemplatePreview";

function App() {
  const isLoggedIn = localStorage.getItem('isLoggedIn'); // Check login status

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/resume" element={isLoggedIn ? <ResumeBuilder /> : <Navigate to="/login" />} /> {/* Protected Route */}
            <Route path="/templates" element={<Templates />} />
            <Route path="/template-preview" element={<TemplatePreview />} />
            <Route path="/" element={(
              <section className="hero">
                <div className="portfolio-card">
                  <img src={profileImg} alt="Profile" className="profile-img" />
                  <h2>Build Your Portfolio with Us</h2>
                  <p>DESIGN PORTFOLIO BUILDER</p>
                  <div className="social-links">
                    <a href="https://www.facebook.com">Facebook</a>
                    <a href="https://www.twitter.com">Twitter</a>
                    <a href="https://www.linkedin.com">LinkedIn</a>
                    <a href="https://www.instagram.com">Instagram</a>
                  </div>
                </div>
                <div className="hero-text">
                  <h1>Hello, Creatives</h1>
                  <p className="subtitle">Empower Your Career with a Stunning Portfolio</p>
                  <div className="cta-buttons">
                    <a href="/login" className="btn">GET STARTED</a> {/* Link to Login */}
                    <a href="/templates" className="btn">VIEW PROJECTS</a> {/* Link to Templates */}
                  </div>
                  <p className="welcome-text">
                    Welcome to our portfolio builder website with a focus on minimal
                    design and appealing content...
                  </p>
                </div>
              </section>
            )} />
          </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
