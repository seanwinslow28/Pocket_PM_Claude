const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting Test Server...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT || 3001);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test routes
app.get('/', (req, res) => {
  res.json({
    message: 'Pocket PM Test Server',
    status: 'Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: port
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: port,
    envVars: {
      PORT: !!process.env.PORT,
      NODE_ENV: !!process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET
    }
  });
});

// Test registration endpoint without database
app.post('/api/register', (req, res) => {
  console.log('Registration attempt received:', req.body);
  res.json({
    success: true,
    message: 'Test registration endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Test Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log('✅ Server is ready to accept connections');
}); 