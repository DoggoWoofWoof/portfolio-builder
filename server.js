// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create an Express app
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Enable CORS for frontend origin
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve static files from the uploads directory

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Timestamp + extension
  }
});

// Initialize Multer
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  professionalExperience: [{
    jobTitle: { type: String },
    company: { type: String },
    duration: { type: String },
    description: { type: String }
  }],
  education: [{
    degree: { type: String },
    institution: { type: String },
    year: { type: String }
  }],
  skills: [String],
  languages: [String],
  linkedin: { type: String },
  github: { type: String },
  image: { type: String }, // Store the image path
  submitted: { type: Boolean, default: false } // Indicates if resume is finalized
});

// User Model
const User = mongoose.model('User', UserSchema);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation regex

// Signup Endpoint
app.post('/api/users/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});

// Login Endpoint
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      userId: user._id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Get user resume data
app.get('/api/users/:id/resume', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
});

// Helper function to parse and validate fields for arrays
const parseArrayField = (field, existingField) => {
  if (Array.isArray(field)) return field; // If already an array, return as is
  if (typeof field === 'string' && field.trim() !== '') {
    try {
      const parsed = JSON.parse(field); // Check if it's a JSON string
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return field.split(',').map(item => item.trim()); // Otherwise, split by commas
    }
  }
  return existingField || []; // Default to the existing field if no valid input
};

// Save progress endpoint
app.put('/api/users/:id/resume', upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { professionalExperience, education, skills, languages, linkedin, github } = req.body;

    user.professionalExperience = professionalExperience ? JSON.parse(professionalExperience) : user.professionalExperience;
    user.education = education ? JSON.parse(education) : user.education;

    user.skills = parseArrayField(skills) || user.skills;
    user.languages = parseArrayField(languages) || user.languages;

    user.linkedin = linkedin && linkedin.trim() !== '' ? linkedin.trim() : user.linkedin;
    user.github = github && github.trim() !== '' ? github.trim() : user.github;

    if (req.file) {
      const newImagePath = `uploads/${req.file.filename}`;
      if (user.image) {
        const oldImagePath = path.join(__dirname, user.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      user.image = newImagePath;
    }

    await user.save();
    res.status(200).json({ message: 'Resume saved successfully', user });
  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({ error: 'Failed to save resume' });
  }
});

// Submit resume endpoint
app.post('/api/users/:id/resume/submit', upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { professionalExperience, education, skills, languages, linkedin, github } = req.body;

    user.professionalExperience = professionalExperience ? JSON.parse(professionalExperience) : user.professionalExperience;
    user.education = education ? JSON.parse(education) : user.education;

    user.skills = parseArrayField(skills) || user.skills;
    user.languages = parseArrayField(languages) || user.languages;

    user.linkedin = linkedin && linkedin.trim() !== '' ? linkedin.trim() : user.linkedin;
    user.github = github && github.trim() !== '' ? github.trim() : user.github;

    if (req.file) {
      const newImagePath = `uploads/${req.file.filename}`;
      if (user.image) {
        const oldImagePath = path.join(__dirname, user.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      user.image = newImagePath;
    }

    user.submitted = true;

    await user.save();
    res.status(200).json({ message: 'Resume submitted successfully', user });
  } catch (error) {
    console.error('Error submitting resume:', error);
    res.status(500).json({ error: 'Failed to submit resume' });
  }
});

// Add education
app.put('/api/users/:id/resume/education', async (req, res) => {
  const { degree, institution, year } = req.body;

  if (!degree || !institution || !year) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.education.push({ degree, institution, year });
    await user.save();

    res.status(200).json({ message: 'Education added successfully', user });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ error: 'An error occurred while adding education' });
  }
});

// Delete experience
app.delete('/api/users/:id/resume/experience/:index', async (req, res) => {
  const index = parseInt(req.params.index);

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (index >= 0 && index < user.professionalExperience.length) {
      user.professionalExperience.splice(index, 1);
      await user.save();
      res.status(200).json({ message: 'Experience removed successfully', user });
    } else {
      res.status(400).json({ error: 'Invalid index' });
    }
  } catch (error) {
    console.error('Error removing experience:', error);
    res.status(500).json({ error: 'An error occurred while removing experience' });
  }
});

// Delete education
app.delete('/api/users/:id/resume/education/:index', async (req, res) => {
  const index = parseInt(req.params.index);

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (index >= 0 && index < user.education.length) {
      user.education.splice(index, 1);
      await user.save();
      res.status(200).json({ message: 'Education removed successfully', user });
    } else {
      res.status(400).json({ error: 'Invalid index' });
    }
  } catch (error) {
    console.error('Error removing education:', error);
    res.status(500).json({ error: 'An error occurred while removing education' });
  }
});

// Delete entire resume
app.delete('/api/users/:id/resume', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Reset all resume-related fields
    user.professionalExperience = [];
    user.education = [];
    user.skills = [];
    user.languages = [];
    user.linkedin = '';
    user.github = '';

    // Delete uploaded image if it exists
    if (user.image) {
      const imagePath = path.join(__dirname, user.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      user.image = '';
    }

    await user.save();
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});