const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config();

const connectDB = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const electionRoutes = require('./routes/electionRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');
const notFound = require('./middleware/notFound');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// CORS — whitelist the frontend dev origin(s)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
  .filter(Boolean)
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));

// Parse JSON request bodies
app.use(express.json());

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);

// 404 for unknown routes
app.use(notFound);

// Centralized error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5050;

// Start the server only after the database connection succeeds
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
