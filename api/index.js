const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
console.log('Starting Express app...');
const paymentInstructionsRouter = require('../src/routes/paymentInstructions');
const errorHandler = require('../src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check (at root level)
app.get('/health', (req, res) => {
  console.log('Health check hit');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

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