// entry point for our Express.js backend (set up server, middleware, and routing)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import database configuration
const { pool } = require('./config/database');

// Import Firebase admin (this will initialize it)
require('./middleware/firebaseAuth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// communication middleware
app.use(cors());
app.use(express.json());

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// auth route (login and register endpoints)
app.use('/api/auth', require('./routes/authRoutes'));

// stocks route
app.use('/api/stocks', require('./routes/stockRoutes'));

// forecast routes (ML but still not sure how it will be connected to the ML)
app.use('/api/forecast', require('./routes/forecastRoutes'));

// news/trending news route
app.use('/api/search', require('./routes/newsRoutes'));

// stock portfolio route
app.use('/api/portfolio', require('./routes/portfolioRoutes'));

//dashboard info route
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

//ai route
app.use('/api/ai', require('./routes/aiRoutes'));

// api routes basis
const testRoutes = require('./routes/testRoute');
app.use('/api', testRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: pool.totalCount > 0 ? 'connected' : 'disconnected'
  });
});

// get the server live
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  pool.end();
  process.exit(0);
});
