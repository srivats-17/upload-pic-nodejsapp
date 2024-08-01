require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define schema and model for photos
const photoSchema = new mongoose.Schema({
  photo: {
    data: Buffer,
    contentType: String
  }
});

const Photo = mongoose.model('Photo', photoSchema);

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Set view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', async (req, res) => {
  const photos = await Photo.find();
  res.render('index', { photos: photos });
});

app.post('/upload', upload.single('photo'), async (req, res) => {
  const newPhoto = new Photo();
  newPhoto.photo.data = req.file.buffer;
  newPhoto.photo.contentType = req.file.mimetype;
  await newPhoto.save();
  res.redirect('/');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});