const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const interviewRoutes = require('./src/routes/interview.routes');
const resumeRoutes = require('./src/routes/resume.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const aiRoutes = require('./src/routes/ai.routes');

const app = express();

// Security
app.use(helmet());
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = (
  process.env.FRONTEND_URL ||
  'http://localhost:5173'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without origin (Postman/mobile apps)
    if (!origin) return callback(null, true);

    // Allow configured frontend URLs
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel deployments/previews
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // Temporary fallback to avoid deployment issues
    return callback(null, true);
  },
  credentials: true
}));

app.use(mongoSanitize());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

// Root Route
app.get('/', (req, res) => {
  res.send('PlacementPrep AI Backend Running');
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'placement-prep-api',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Server error'
  });
});

// Improve DNS resolution on Render
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// MongoDB Connection + Start Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });