const express = require('express');
const cors = require('cors');
const logRoutes = require('./routes/logs');

const app = express();

// Middleware
app.use(cors());
// Set a higher limit to accommodate up to 10,000 log records in JSON format
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/logs', logRoutes);

module.exports = app;
