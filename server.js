const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

console.log('🚀 Starting Pocket PM Backend...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', port);
console.log('🔑 Environment variables check:');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');

// Database connection with Railway-specific configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Railway-specific configurations
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
  // Handle Railway's internal network
  host: process.env.DATABASE_URL ? undefined : 'postgres.railway.internal',
  port: process.env.DATABASE_URL ? undefined : 5432,
  database: process.env.DATABASE_URL ? undefined : 'railway',
  user: process.env.DATABASE_URL ? undefined : 'postgres',
  password: process.env.DATABASE_URL ? undefined : process.env.PGPASSWORD
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection with retry logic
async function connectWithRetry() {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const client = await pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      client.release();
      return true;
    } catch (err) {
      console.error(`❌ Database connection attempt ${retries + 1} failed:`, err.message);
      retries++;
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in ${retries * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retries * 2000));
      }
    }
  }
  
  console.error('💥 Failed to connect to database after', maxRetries, 'attempts');
  console.log('⚠️  Server will continue without database connection');
  return false;
}

// Create users table if it doesn't exist
async function createUsersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
  }
}

// Initialize database connection (but don't block server startup)
connectWithRetry().then((connected) => {
  if (connected) {
    createUsersTable();
  }
}).catch((err) => {
  console.error('❌ Database initialization failed:', err);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not set' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check with database status
app.get('/health', async (req, res) => {
  let dbStatus = 'Unknown';
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    dbStatus = 'Connected';
  } catch (error) {
    dbStatus = 'Disconnected: ' + error.message;
  }
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbStatus,
    port: port,
    version: '1.0.0'
  });
});

// Simple root route
app.get('/', (req, res) => {
  res.json({
    message: 'Pocket PM Backend API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      health: '/health',
      register: 'POST /api/register',
      login: 'POST /api/login',
      analyze: 'POST /api/analyze',
      user: 'GET /api/user'
    }
  });
});

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Analysis endpoint
app.post('/api/analyze', authenticateToken, async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length === 0) {
      return res.status(400).json({ error: 'Product idea is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Prepare the prompt for OpenAI
    const prompt = `As a senior product manager and startup advisor, analyze the following product idea and provide a comprehensive analysis:

Product Idea: "${idea}"

Please provide a detailed analysis with the following sections:

1. **Idea Overview & Value Proposition**
   - Core problem being solved
   - Target audience
   - Unique value proposition

2. **Market Landscape**
   - Market size and opportunity
   - Key competitors and differentiation
   - Market trends and timing

3. **Timing & Market Readiness**
   - Why now? Market timing analysis
   - Technology readiness
   - User behavior trends

4. **Pain Points & Challenges**
   - Technical challenges
   - Go-to-market challenges
   - Potential risks

5. **Feasibility Assessment**
   - Technical feasibility (1-10 scale)
   - Market feasibility (1-10 scale)
   - Resource requirements

6. **Go-to-Market Strategy**
   - Suggested launch approach
   - Key success metrics
   - Next steps and MVP recommendations

Please be specific, actionable, and include relevant examples where applicable.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a senior product manager and startup advisor with expertise in product analysis, market research, and go-to-market strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    res.json({
      success: true,
      idea: idea,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      userId: req.user.userId
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.message.includes('OpenAI API')) {
      res.status(500).json({ error: 'AI analysis service temporarily unavailable' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get current user (protected route)
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Pocket PM Backend running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log('✅ Server is ready to accept connections');
}); 