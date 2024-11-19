// src/pages/Contact.js
import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>If you have any questions or inquiries, feel free to reach out to us!</p>
      
      <div className="contact-details">
        <h2>Contact Information</h2>
        <p><strong>Email:</strong> <a href="mailto:info@example.com">info@example.com</a></p>
        <p><strong>Phone:</strong> <a href="tel:+1234567890">+1 (234) 567-890</a></p>
        
        <h2>Follow Us</h2>
        <p>
          <strong>Facebook:</strong> <a href="https://facebook.com">facebook.com/example</a><br />
          <strong>Twitter:</strong> <a href="https://twitter.com">twitter.com/example</a><br />
          <strong>Instagram:</strong> <a href="https://instagram.com">instagram.com/example</a>
        </p>
      </div>

      <div className="contact-form">
        <h2>Send Us a Message</h2>
        <form>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" rows="4" required></textarea>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
