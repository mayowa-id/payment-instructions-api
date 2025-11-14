const { buildFailedResponse } = require('../utils/executor');

module.exports = (err, req, res, next) => {
  console.error('Error:', err);

  const response = buildFailedResponse(err);
  res.status(400).json(response);
};