require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet()); // Protects against common web vulnerabilities
app.use(cors()); // Allow all local requests for testing
app.use(express.json({ limit: '10kb' })); // Prevent payload overload

// Rate limiting to prevent brute force/DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.'
});
app.use('/api/', apiLimiter);

// Health Check Endpoint (For monitoring/uptime)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date() });
});

// Route Placeholders (We will build these next)
 app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/assessments', require('./src/routes/assessmentRoutes'));
// app.use('/api/counsellors', require('./src/routes/counsellorRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Secure API running on port ${PORT}`);
});