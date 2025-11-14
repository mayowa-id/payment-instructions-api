const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const paymentInstructionsRouter = require('../src/routes/paymentInstructions');
const errorHandler = require('../src/middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/payment-instructions', paymentInstructionsRouter);

// Health check
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

// 404 for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

// Local dev listen
// if (require.main === module) {
//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

module.exports = app;