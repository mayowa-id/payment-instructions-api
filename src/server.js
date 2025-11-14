const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const paymentInstructionsRouter = require('./routes/paymentInstructions');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet()); 
app.use(cors()); 
app.use(morgan('combined')); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/payment-instructions', paymentInstructionsRouter);

app.use(errorHandler);


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

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Endpoint: POST http://localhost:${PORT}/payment-instructions`);
  });
}

module.exports = app;
