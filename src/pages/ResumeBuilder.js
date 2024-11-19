// src/pages/ResumeBuilder.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumeBuilder.css';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState({
    professionalExperience: [{ jobTitle: '', company: '', duration: '', description: '' }],
    education: [{ degree: '', institution: '', year: '' }],
    skills: [],
    languages: [],
    linkedin: "",
    github: "",
    image: null,
  });

  const [imageUrl, setImageUrl] = useState(null);
  const alertShownRef = useRef(false);

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  // Load resume data from the server
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId && !alertShownRef.current) {
        axios.get(`http://localhost:5000/api/users/${userId}/resume`)
            .then((response) => {
                if (response.data) {
                    setResumeData({
                        ...resumeData,   // <-- resumeData now part of the dependency array
                        ...response.data,
                        professionalExperience: response.data.professionalExperience.length
                            ? response.data.professionalExperience
                            : [{ jobTitle: '', company: '', duration: '', description: '' }],
                        education: response.data.education.length
                            ? response.data.education
                            : [{ degree: '', institution: '', year: '' }],
                    });
                    if (response.data.image) {
                        setImageUrl(`http://localhost:5000/${response.data.image}`);
                    }
                }
            })
            .catch((error) => {
                console.error('Error fetching resume data:', error);
            });
        alertShownRef.current = true;
    }
}, [resumeData]);  // Adding resumeData to the dependency array

  const handleInputChange = (e, index, section) => {
    const { name, value } = e.target;
    if (section === 'professionalExperience') {
      const updatedExperiences = [...resumeData.professionalExperience];
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        [name]: value || '',
      };
      setResumeData({ ...resumeData, professionalExperience: updatedExperiences });
    } else if (section === 'education') {
      const updatedEducation = [...resumeData.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [name]: value || '',
      };
      setResumeData({ ...resumeData, education: updatedEducation });
    } else {
      setResumeData({ ...resumeData, [name]: value || '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setResumeData({ ...resumeData, image: file });

        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file.');
      }
    }
  };

  const handleAddExperience = () => {
    const newExperience = { jobTitle: '', company: '', duration: '', description: '' };
    setResumeData({
      ...resumeData,
      professionalExperience: [...resumeData.professionalExperience, newExperience],
    });
  };

  const handleAddEducation = () => {
    const newEducation = { degree: '', institution: '', year: '' };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEducation],
    });
  };

  const handleDeleteExperience = (index) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
  
    // Check if the experience exists on the server
    if (resumeData.professionalExperience[index].id) {
      // If it has an ID, delete it from the server
      axios
        .delete(`http://localhost:5000/api/users/${userId}/resume/experience/${resumeData.professionalExperience[index].id}`)
        .then(() => {
          const updatedExperiences = resumeData.professionalExperience.filter((_, i) => i !== index);
          setResumeData({ ...resumeData, professionalExperience: updatedExperiences });
          alert('Experience deleted successfully.');
        })
        .catch((error) => {
          console.error('Error deleting experience:', error);
          alert('Failed to delete experience.');
        });
    } else {
      // If it doesn't have an ID, simply remove it locally
      const updatedExperiences = resumeData.professionalExperience.filter((_, i) => i !== index);
      setResumeData({ ...resumeData, professionalExperience: updatedExperiences });
      alert('Unsaved experience removed successfully.');
    }
  };
  
  const handleDeleteEducation = (index) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
  
    // Check if the education exists on the server
    if (resumeData.education[index].id) {
      // If it has an ID, delete it from the server
      axios
        .delete(`http://localhost:5000/api/users/${userId}/resume/education/${resumeData.education[index].id}`)
        .then(() => {
          const updatedEducation = resumeData.education.filter((_, i) => i !== index);
          setResumeData({ ...resumeData, education: updatedEducation });
          alert('Education deleted successfully.');
        })
        .catch((error) => {
          console.error('Error deleting education:', error);
          alert('Failed to delete education.');
        });
    } else {
      // If it doesn't have an ID, simply remove it locally
      const updatedEducation = resumeData.education.filter((_, i) => i !== index);
      setResumeData({ ...resumeData, education: updatedEducation });
      alert('Unsaved education removed successfully.');
    }
  };  

  const handleSaveProgress = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
  
    const formData = new FormData();
    Object.entries(resumeData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        formData.append('image', value); // Append image only if it exists
      } else if (Array.isArray(value) || typeof value === 'object') {
        // Handle arrays and objects by JSON stringifying them
        const existingValue = formData.get(key); // Check if the key already exists in formData
        if (existingValue) {
          // If the field already exists and is an array, merge the current and new values
          const existingArray = JSON.parse(existingValue);
          const newArray = Array.isArray(value) ? value : [value];
          // Merge and remove duplicates (if needed)
          formData.set(key, JSON.stringify([...new Set([...existingArray, ...newArray])]));
        } else {
          formData.append(key, JSON.stringify(value)); // Append as a string if it's new
        }
      } else {
        // For other values (simple string or number), append normally
        formData.append(key, value || ''); // Ensure no undefined or null values
      }
    });
  
    axios.put(`http://localhost:5000/api/users/${userId}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        alert('Progress saved successfully.');
        navigate('/templates');
      })
      .catch((error) => {
        console.error('Error saving progress:', error);
        alert('Failed to save progress. Please try again.');
      });
  };
  
  const handleSubmit = () => {
    console.log('Submitting resumeData:', resumeData);
    const userId = localStorage.getItem('userId');
    if (!userId) return;
  
    const formData = new FormData();
  
    Object.entries(resumeData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        formData.append('image', value); // Append image only if it exists
      } else if (Array.isArray(value) || typeof value === 'object') {
        // Handle arrays and objects by JSON stringifying them
        const existingValue = formData.get(key); // Check if the key already exists in formData
        if (existingValue) {
          // If the field already exists and is an array, merge the current and new values
          const existingArray = JSON.parse(existingValue);
          const newArray = Array.isArray(value) ? value : [value];
          // Merge and remove duplicates (if needed)
          formData.set(key, JSON.stringify([...new Set([...existingArray, ...newArray])]));
        } else {
          formData.append(key, JSON.stringify(value)); // Append as a string if it's new
        }
      } else {
        // For other values (simple string or number), append normally
        formData.append(key, value || ''); // Ensure no undefined or null values
      }
    });
  
    axios
      .post(`http://localhost:5000/api/users/${userId}/resume/submit`, formData)
      .then(() => {
        alert('Resume submitted successfully!');
        navigate('/templates');
      })
      .catch((error) => {
        console.error('Error submitting resume:', error);
        alert('Failed to submit resume.');
      });
  };      

  const handleDeleteResume = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    axios.delete(`http://localhost:5000/api/users/${userId}/resume`)
      .then(() => {
        alert('Resume deleted successfully.');
        setResumeData({
          professionalExperience: [],
          education: [],
          skills: [],
          languages: [],
          linkedin: '',
          github: '',
          image: null,
        });
        setImageUrl(null);
      })
      .catch((error) => {
        console.error('Error deleting resume:', error);
        alert('Failed to delete resume.');
      });
  };

  return (
    <div className="resume-builder">
      <h1>Build Your Resume</h1>

      <h2>Profile Picture</h2>
      <input type="file" accept="image/*" name="image" onChange={handleFileChange} />

      {/* Image Preview Section */}
      {imageUrl && (
        <div>
          <h3>Uploaded Profile Picture:</h3>
          <img src={imageUrl} alt="Profile" width="100" height="100" />
        </div>
      )}

<h2>Professional Experience</h2>
{resumeData.professionalExperience.map((experience, index) => (
  <div key={index} className="experience-entry">
    <label>Job Title</label>
    <input
      type="text"
      name="jobTitle"
      value={experience.jobTitle}
      onChange={(e) => handleInputChange(e, index, 'professionalExperience')}
    />
    <label>Company</label>
    <input
      type="text"
      name="company"
      value={experience.company}
      onChange={(e) => handleInputChange(e, index, 'professionalExperience')}
    />
    <label>Duration</label>
    <input
      type="text"
      name="duration"
      value={experience.duration}
      onChange={(e) => handleInputChange(e, index, 'professionalExperience')}
    />
    <label>Description</label>
    <textarea
      name="description"
      value={experience.description}
      onChange={(e) => handleInputChange(e, index, 'professionalExperience')}
    />
    <button onClick={() => handleDeleteExperience(index)}>Delete</button>
  </div>
))}
<button onClick={handleAddExperience}>Add Another Experience</button>

<h2>Education</h2>
{resumeData.education.map((edu, index) => (
  <div key={index} className="education-entry">
    <label>Degree</label>
    <input
      type="text"
      name="degree"
      value={edu.degree}
      onChange={(e) => handleInputChange(e, index, 'education')}
    />
    <label>Institution</label>
    <input
      type="text"
      name="institution"
      value={edu.institution}
      onChange={(e) => handleInputChange(e, index, 'education')}
    />
    <label>Year</label>
    <input
      type="text"
      name="year"
      value={edu.year}
      onChange={(e) => handleInputChange(e, index, 'education')}
    />
    <button onClick={() => handleDeleteEducation(index)}>Delete</button>
  </div>
))}
<button onClick={handleAddEducation}>Add Another Education</button>

      <h2>Additional Information</h2>
      <label>Skills</label>
      <input
        type="text"
        name="skills"
        value={resumeData.skills}
        onChange={handleInputChange}
      />
      <label>Languages</label>
      <input
        type="text"
        name="languages"
        value={resumeData.languages}
        onChange={handleInputChange}
      />
      <label>LinkedIn</label>
      <input
        type="text"
        name="linkedin"
        value={resumeData.linkedin}
        onChange={handleInputChange}
      />
      <label>GitHub</label>
      <input
        type="text"
        name="github"
        value={resumeData.github}
        onChange={handleInputChange}
      />
      <button onClick={handleSaveProgress}>Save Progress</button>
      <button onClick={handleSubmit}>Submit Resume</button>
      <button onClick={handleDeleteResume}>Delete Resume</button>
    </div>
  );
};

export default ResumeBuilder;
