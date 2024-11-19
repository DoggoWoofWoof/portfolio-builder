// /src/pages/About.js
import React from 'react';
import './About.css';
import aboutImg from "../assets/about-image.jpeg";
import client1 from "../assets/client1.png";
import client2 from "../assets/client2.png";
import client3 from "../assets/client3.png";
import client4 from "../assets/client4.png";
import client5 from "../assets/client5.png";

const About = () => {
  return (
    <div className="about-container">
      <h1>About Us</h1>
      <p>Finding Inspiration in Every Turn</p>
      <p>
        This is your About Page. This space is a great opportunity to give a full background on who you are, what you do, and what your website has to offer. Double-click on the text box to start editing your content and make sure to add all the relevant details you want site visitors to know.
      </p>
      <img 
        src={aboutImg}
        alt="Our Story"
        className="about-image"
      />
      
      <h2>Our Story</h2>
      <p>
        Every website has a story, and your visitors want to hear yours. This space is a great opportunity to give a full background on who you are, what your team does, and what your site has to offer. Double-click on the text box to start editing your content and make sure to add all the relevant details you want site visitors to know.
      </p>
      <p>
        If you're a business, talk about how you started and share your professional journey. Explain your core values, your commitment to customers, and how you stand out from the crowd. Add a photo, gallery, or video for even more engagement.
      </p>
      
      <h2>Our Clients</h2>
      <div className="client-logos">
        <img src={client1} alt="Client 1" />
        <img src={client2} alt="Client 2" />
        <img src={client3} alt="Client 3" />
        <img src={client4} alt="Client 4" />
        <img src={client5} alt="Client 5" />
      </div>
    </div>
  );
};

export default About;
