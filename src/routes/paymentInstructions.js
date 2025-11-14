const express = require('express');
const router = express.Router();
const { parseInstruction } = require('../utils/parser');
const { validate } = require('../utils/validator');
const { execute } = require('../utils/executor');

router.post('/', async (req, res, next) => {
  try {
    const { accounts, instruction } = req.body;
    
    if (!Array.isArray(accounts) || accounts.length === 0 || typeof instruction !== 'string' || !instruction.trim()) {
      throw { code: 'SY03', reason: 'Invalid or missing accounts/instruction' };
    }

    const parsed = parseInstruction(instruction);
    console.log('Parsed:', parsed);

    const validation = validate(parsed, accounts);
    if (!validation.valid) {
      throw validation;
    }
    console.log('Validated: OK');

    const response = execute(parsed, accounts);
    console.log('Executed:', response);

    res.status(200).json(response);
  } catch (error) {
    console.log('Error:', error);
    next(error);
  }
});

module.exports = router;