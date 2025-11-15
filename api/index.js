const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Logs for boot debug
console.log('Starting Express app...');

// Import routes and middleware
const paymentInstructionsRouter = require('../src/routes/paymentInstructions');
const errorHandler = require('../src/middleware/errorHandler');

// Init app
const app = express();

// Middleware (morgan can be slow; comment if testing)
app.use(helmet());
app.use(cors());
// app.use(morgan('combined')); // Comment temporarily if logs slow boot
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check (at root level)
app.get('/health', (req, res) => {
  console.log('Health check hit');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Payment instructions (POST only)
app.use('/payment-instructions', paymentInstructionsRouter);

// Root
app.get('/', (req, res) => {
  console.log('Root hit');
  res.json({
    message: 'Payment Instructions API',
    endpoints: {
      health: '/health',
      paymentInstructions: '/payment-instructions'
    }
  });
});

// 404 catcher
app.use('*', (req, res) => {
  console.log('404 hit for:', req.path);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Local dev
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

console.log('App initialized');