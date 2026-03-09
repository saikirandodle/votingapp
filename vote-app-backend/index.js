const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/vote-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Models
const CitizenSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  mobileNo: String,
  wardNo: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  username: String,
  password: String,
  encryptedPassword: String,
  photo: String, // Field to store the URL of the citizen's photo
});

const PartySchema = new mongoose.Schema({
  name: { type: String, unique: true }, // Make party name unique
  candidateName: String,
  photo: String,
  details: String,
  votes: { type: Number, default: 0 },
});

const Citizen = mongoose.model('Citizen', CitizenSchema);
const Party = mongoose.model('Party', PartySchema);

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

// Admin Login Route
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Citizen Login Route
app.post('/citizen/login', async (req, res) => {
  const { username, password, isAdmin } = req.body;

  if (isAdmin) {
    // Admin login
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      return res.status(200).json({ message: 'Admin login successful' });
    } else {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } else {
    // Citizen login
    try {
      const citizen = await Citizen.findOne({ username });
      if (!citizen) {
        return res.status(404).json({ error: 'Citizen not found' });
      }

      if (citizen.password === password) {
        return res.status(200).json({ message: 'Password change required', changePassword: true });
      } else if (citizen.encryptedPassword && await bcrypt.compare(password, citizen.encryptedPassword)) {
        return res.status(200).json({ message: 'Citizen login successful', changePassword: false });
      } else {
        return res.status(401).json({ error: 'Invalid citizen credentials' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to login' });
    }
  }
});

// Update Citizen Change Password Route
app.post('/citizen/change-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    const citizen = await Citizen.findOne({ username });
    if (!citizen) {
      return res.status(404).json({ error: 'Citizen not found' });
    }

    // Check if the old password matches
    if (citizen.password === oldPassword) {
      // Encrypt the new password
      const encryptedPassword = await bcrypt.hash(newPassword, 10);

      // Update the citizen's password
      citizen.password = undefined; // Remove plain password
      citizen.encryptedPassword = encryptedPassword;
      await citizen.save();

      res.status(200).json({ message: 'Password changed successfully' });
    } else {
      res.status(401).json({ error: 'Old password is incorrect' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Citizen: Logout
app.post('/citizen/logout', (req, res) => {
  try {
    // Clear the session or token (if applicable)
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error.message);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Routes
// Middleware for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/citizens'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Admin: Add Citizen
app.post('/admin/add-citizen', upload.single('photo'), async (req, res) => {
  try {
    const { firstName, lastName, mobileNo, wardNo, address, city, state, pincode } = req.body;
    let { username, password } = req.body;

    // Generate username and password if not provided
    if (!username) {
      username = `${firstName.toLowerCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!password) {
      password = `${Math.random().toString(36).slice(-8)}`; // Generate random 8-character password
    }

    const photo = req.file ? `/uploads/citizens/${req.file.filename}` : null;

    const newCitizen = new Citizen({
      firstName,
      lastName,
      mobileNo,
      wardNo,
      address,
      city,
      state,
      pincode,
      username,
      password, // Save plain password initially
      photo,
    });

    await newCitizen.save();
    res.status(201).json({ message: 'Citizen added successfully', username, password });
  } catch (error) {
    console.error('Error adding citizen:', error.message);
    res.status(500).json({ error: 'Failed to add citizen' });
  }
});

// Admin: Add Party
app.post('/admin/add-party', async (req, res) => {
  const { name, candidateName, photo, details } = req.body;

  const newParty = new Party({
    name,
    candidateName,
    photo,
    details,
  });

  try {
    await newParty.save();
    res.status(201).json({ message: 'Party added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add party' });
  }
});

// CRUD Operations for Citizens
// Get all citizens
app.get('/admin/citizens', async (req, res) => {
  try {
    const citizens = await Citizen.find();
    res.status(200).json(citizens);
  } catch (error) {
    console.error('Error fetching citizens:', error.message);
    res.status(500).json({ error: 'Failed to fetch citizens' });
  }
});

// Update a citizen
app.put('/admin/citizens/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, mobileNo, wardNo, address, city, state, pincode, username, password } = req.body;
    const photo = req.file ? `/uploads/citizens/${req.file.filename}` : null;

    const updatedData = {
      firstName,
      lastName,
      mobileNo,
      wardNo,
      address,
      city,
      state,
      pincode,
      username,
      password,
    };

    if (photo) {
      updatedData.photo = photo;
    }

    console.log('Update Citizen Request:', { id, updatedData });

    const updatedCitizen = await Citizen.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedCitizen) {
      console.error('Citizen not found with ID:', id);
      return res.status(404).json({ error: 'Citizen not found' });
    }

    console.log('Updated Citizen:', updatedCitizen);
    res.status(200).json({ message: 'Citizen updated successfully', updatedCitizen });
  } catch (error) {
    console.error('Error updating citizen:', error.message);
    res.status(500).json({ error: 'Failed to update citizen' });
  }
});

// Delete a citizen
app.delete('/admin/citizens/:id', async (req, res) => {
  try {
    const deletedCitizen = await Citizen.findByIdAndDelete(req.params.id);
    if (!deletedCitizen) {
      return res.status(404).json({ error: 'Citizen not found' });
    }
    res.status(200).json({ message: 'Citizen deleted successfully' });
  } catch (error) {
    console.error('Error deleting citizen:', error.message);
    res.status(500).json({ error: 'Failed to delete citizen' });
  }
});

// CRUD Operations for Parties
// Get all parties
app.get('/admin/parties', async (req, res) => {
  try {
    const parties = await Party.find();
    res.status(200).json(parties);
  } catch (error) {
    console.error('Error fetching parties:', error.message);
    res.status(500).json({ error: 'Failed to fetch parties' });
  }
});

// Update a party
app.put('/admin/parties/:id', async (req, res) => {
  try {
    const updatedParty = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedParty) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.status(200).json({ message: 'Party updated successfully', updatedParty });
  } catch (error) {
    console.error('Error updating party:', error.message);
    res.status(500).json({ error: 'Failed to update party' });
  }
});

// Delete a party
app.delete('/admin/parties/:id', async (req, res) => {
  try {
    const deletedParty = await Party.findByIdAndDelete(req.params.id);
    if (!deletedParty) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.status(200).json({ message: 'Party deleted successfully' });
  } catch (error) {
    console.error('Error deleting party:', error.message);
    res.status(500).json({ error: 'Failed to delete party' });
  }
});

// Citizen: Change Password
app.post('/citizen/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    const citizen = await Citizen.findOne({ username });
    if (!citizen || citizen.password !== oldPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    citizen.encryptedPassword = encryptedPassword;
    citizen.password = null; // Clear plain password only after successful encryption
    await citizen.save();

    res.status(200).json({ message: 'Password updated successfully. Please log in again.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Citizen: Vote
app.post('/citizen/vote', async (req, res) => {
  const { partyName } = req.body; // Use partyName instead of partyId

  console.log('Received vote request for partyName:', partyName);

  try {
    if (!partyName) {
      console.error('No partyName provided in the request body.');
      return res.status(400).json({ error: 'partyName is required' });
    }

    const party = await Party.findOne({ name: partyName }); // Find party by name
    if (!party) {
      console.error('Party not found for partyName:', partyName);
      return res.status(404).json({ error: 'Party not found' });
    }

    party.votes += 1;
    await party.save();

    console.log('Vote successfully cast for partyName:', partyName);
    res.status(200).json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.error('Error casting vote:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to cast vote', details: error.message });
  }
});

// Admin: View Results
app.get('/admin/results', async (req, res) => {
  try {
    const parties = await Party.find();
    const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0);

    const results = parties.map((party) => ({
      id: party._id,
      name: party.name,
      candidateName: party.candidateName,
      votes: party.votes,
      percentage: totalVotes ? ((party.votes / totalVotes) * 100).toFixed(2) : 0,
    }));

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Route to add a new citizen
app.post('/citizen/add', async (req, res) => {
  try {
    const { firstName, lastName, mobileNo, wardNo, address, city, state, pincode } = req.body;

    // Generate username and password
    const username = `${firstName.toLowerCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    const password = `${Math.random().toString(36).slice(-8)}`; // Generate random 8-character password

    // Save citizen to the database
    const newCitizen = new Citizen({
      firstName,
      lastName,
      mobileNo,
      wardNo,
      address,
      city,
      state,
      pincode,
      username,
      password, // Save plain password initially
    });

    await newCitizen.save();

    res.status(201).json({ message: 'Citizen added successfully', username, password });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add citizen' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});