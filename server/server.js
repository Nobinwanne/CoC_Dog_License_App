// server/server.js
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5030;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SQL Server configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Database connection pool
let pool;

// Initialize database connection
const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

// Make pool accessible to routes
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Import routes
const ownerRoutes = require('./routes/owners');
const dogRoutes = require('./routes/dogs');
const licenseRoutes = require('./routes/licenses');
const tagRoutes = require('./routes/tags');
const kennelRoutes = require('./routes/kennels')


// API routes
app.use('/api/owners', ownerRoutes);
app.use('/api/dogs', dogRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/kennels', kennelRoutes)


// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dog License API',
    version: '1.0.0',
    endpoints: {
      owners: '/api/owners',
      dogs: '/api/dogs',
      licenses: '/api/licenses',
      payments: '/api/payments',
      health: '/api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await pool.close();
  process.exit(0);
});