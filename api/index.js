const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const paymentInstructionsRouter = require('../src/routes/paymentInstructions');
const errorHandler = require('../src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/payment-instructions', paymentInstructionsRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Payment Instructions API',
    endpoints: {
      health: '/health',
      paymentInstructions: '/payment-instructions'
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

module.exports = serverless(app, {
  binary: ['*/*']
});