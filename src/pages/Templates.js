// src/pages/Templates.js
import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Template from '../components/Template';

const Templates = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null); // Set initial state to null for conditional rendering

  const templateRequirements = {
    template1: {
      requiredFields: ['firstName', 'lastName', 'email', 'professionalExperience', 'education'],
      background: '#f0e68c', // Define background color
      htmlContent: (data, background) => {
        return `
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            h1 { font-size: 28px; color: #2C3E50; text-align: center; margin-bottom: 0.5em; }
            p { font-size: 16px; color: #4A4A4A; line-height: 1.6; text-align: center; }
            a { color: #3498DB; text-decoration: none; margin: 0 5px; }
            .section { margin: 20px 0; }
            .experience, .education { margin: 10px 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .profile-image { width: 150px; height: 150px; border-radius: 50%; display: block; margin: 0 auto; }
            .header { background: ${background}; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
          </style>
          <div class="container">
            <div class="header">
              <h1>${data.firstName || ''} ${data.lastName || ''}</h1>
              ${data.image ? `<img src="http://localhost:5000/${data.image}" alt="Profile Image" class="profile-image"/>` : ''}
              ${data.email ? `<p><a href="mailto:${data.email}">${data.email}</a></p>` : ''}
            </div>
            ${data.professionalExperience && data.professionalExperience.length > 0 ? `
              <div class="section">
                <h2>Work Experience</h2>
                ${data.professionalExperience.map(job => `
                  <div class="experience">
                    <h3>${job.company || ''}</h3>
                    <p>${job.duration || ''}</p>
                    <h4>${job.jobTitle || ''}</h4>
                    <p>${job.description || ''}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${data.education && data.education.length > 0 ? `
              <div class="section">
                <h2>Education</h2>
                ${data.education.map(edu => `
                  <div class="education">
                    <h3>${edu.institution || ''}</h3>
                    <p>${edu.degree || ''} (${edu.year || ''})</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      },
    },
    template2: {
      requiredFields: ['firstName', 'lastName', 'email', 'professionalExperience', 'skills', 'linkedin', 'github'],
      background: '#f4f4f4', // Define background color
      htmlContent: (data, background) => {
        return `
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            h1 { font-size: 28px; color: #2C3E50; text-align: center; margin-bottom: 0.5em; }
            h2 { font-size: 24px; color: #2C3E50; margin-top: 20px; }
            p { font-size: 16px; color: #4A4A4A; line-height: 1.6; text-align: center; }
            a { color: #3498DB; text-decoration: none; margin: 0 5px; }
            .section { margin: 20px 0; }
            .header { background-color: ${background}; padding: 10px; border-radius: 8px; }
          </style>
          <div class="container">
            <h1>${data.firstName || ''} ${data.lastName || ''}</h1>
            <div class="section">
              <h2>Contact Information</h2>
              <p>${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : 'No email provided.'}</p>
              <p>${data.linkedin ? `<a href="${data.linkedin}">LinkedIn</a>` : ''} ${data.github ? `<a href="${data.github}">GitHub</a>` : ''}</p>
            </div>
            <div class="section">
              <h2>Skills</h2>
              <p>${data.skills ? data.skills.join(', ') : 'No skills listed.'}</p>
            </div>
            <div class="section">
              <h2>Languages</h2>
              <p>${data.languages ? data.languages.join(', ') : 'No Languages listed.'}</p>
            </div>
          </div>
        `;
      },
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('User ID not found. Please log in again.');
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`/api/users/${userId}/resume`);
        setUserData(response.data || {});
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleTemplateClick = (templateKey) => {
    if (!userData) return;

    const missingFields = templateRequirements[templateKey].requiredFields.filter(
      (field) => !userData[field] || (Array.isArray(userData[field]) && userData[field].length === 0)
    );

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      navigate('/resume');
    } else {
      const generatedHtmlContent = templateRequirements[templateKey].htmlContent(userData, templateRequirements[templateKey].background);
      navigate(`/template-preview`, {
        state: {
          title: `Template ${templateKey.slice(-1)}`,
          htmlContent: generatedHtmlContent,
          background: templateRequirements[templateKey].background,
        },
      });
    }
  };

  return (
    <div>
      <h1>Select a Template</h1>
      {loading ? (
        <p>Loading...</p>
      ) : userData ? ( // Conditionally render templates after userData loads
        <div className="template-list" style={{ display: 'flex', justifyContent: 'space-around' }}>
          {Object.keys(templateRequirements).map((templateKey) => (
            <div
              key={templateKey}
              className="template-box"
              onClick={() => handleTemplateClick(templateKey)}
              style={{ flex: '1', margin: '10px' }}
            >
              <Template
                title={`Template ${templateKey.slice(-1)}`}
                htmlContent={templateRequirements[templateKey].htmlContent(userData, templateRequirements[templateKey].background)}
                background={templateRequirements[templateKey].background}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No data found. Please complete your resume.</p>
      )}
    </div>
  );
};

export default Templates;
