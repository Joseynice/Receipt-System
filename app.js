require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');
const receiptRoutes = require('./src/routes/receiptRoutes');
const pageRoute = require('./src/routes/pageRoutes');
const dbConnect = require('./src/config/dbConfig');
const upload = require('./src/helpers/handleImage.js');
const path = require('path');
const app = express();

// Import env variables
const port = process.env.APP_PORT || 6061;

// Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route paths
app.use('/auth', authRoutes);  // Authentication routes
app.use('/', receiptRoutes);  // Ensure receipt routes have a base path
app.use('/', pageRoute);  // General page routes

// MongoDB connection
dbConnect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
