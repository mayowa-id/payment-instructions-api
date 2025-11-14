function parseInstruction(original) {
  if (typeof original !== 'string' || !original.trim()) {
    throw { code: 'SY03', reason: 'Instruction empty or not string' };
  }

  const origTrimmed = original.trim();
  const normTrimmed = origTrimmed.toLowerCase();
  
  const words = splitWords(normTrimmed);
  const origWords = splitWords(origTrimmed);

  if (words.length < 11) {
    throw { code: 'SY03', reason: 'Malformed instruction: too few words' };
  }

  const first = words[0];
  if (first === 'debit') {
    return parseDebit(origWords, words);
  }
  if (first === 'credit') {
    return parseCredit(origWords, words);
  }
  throw { code: 'SY01', reason: `Missing required keyword: DEBIT or CREDIT (got "${first}")` };
}

function splitWords(str) {
  const words = [];
  let start = 0;
  while (start < str.length) {
    let end = str.indexOf(' ', start);
    if (end === -1) end = str.length;
    const word = str.substring(start, end).trim();
    if (word) words.push(word);
    start = end + 1;
  }
  return words;
}

function isDigitStr(s) {
  if (!s || s.length === 0) return false;
  for (let i = 0; i < s.length; i++) {
    if (s.charAt(i) < '0' || s.charAt(i) > '9') return false;
  }
  return true;
}

function isValidCurrencyFormat(curr) {
  if (curr.length !== 3) return false;
  for (let i = 0; i < 3; i++) {
    const c = curr.charAt(i);
    if (c < 'a' || c > 'z') return false;
  }
  return true;
}

function isValidDateFormat(dateStr) {
  if (dateStr.length !== 10) return false;
  if (dateStr.charAt(4) !== '-' || dateStr.charAt(7) !== '-') return false;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(5, 7);
  const day = dateStr.substring(8, 10);
  return isDigitStr(year) && isDigitStr(month) && isDigitStr(day);
}

function parseDebit(origWords, words) {
  if (!(words[3] === 'from' && words[4] === 'account' && words[6] === 'for' && 
        words[7] === 'credit' && words[8] === 'to' && words[9] === 'account')) {
    throw { code: 'SY02', reason: 'Invalid keyword order for DEBIT format' };
  }

  const amountStr = words[1];
  const amount = parseInt(amountStr, 10);
  // Basic: Must be integer >0 (no decimals via parseInt check)
  if (isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
    throw { code: 'AM01', reason: 'Amount must be a positive integer' };
  }

  const currency = words[2];
  if (!isValidCurrencyFormat(currency)) {
    throw { code: 'SY03', reason: 'Invalid currency format' };
  }

  const debit_account = origWords[5];
  const credit_account = origWords[10];
  if (!debit_account || !credit_account) {
    throw { code: 'SY03', reason: 'Missing account IDs' };
  }

  let execute_by = null;
  const len = words.length;
  if (len === 13 && words[11] === 'on') {
    const date = words[12]; 
    if (!isValidDateFormat(date)) {
      throw { code: 'DT01', reason: 'Invalid date format' };
    }
    execute_by = date; 
  } else if (len !== 11) {
    throw { code: 'SY03', reason: 'Unexpected extra words' };
  }

  return { type: 'DEBIT', amount, currency: currency.toUpperCase(), debit_account, credit_account, execute_by };
}

function parseCredit(origWords, words) {
  if (!(words[3] === 'to' && words[4] === 'account' && words[6] === 'for' && 
        words[7] === 'debit' && words[8] === 'from' && words[9] === 'account')) {
    throw { code: 'SY02', reason: 'Invalid keyword order for CREDIT format' };
  }

  const amountStr = words[1];
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
    throw { code: 'AM01', reason: 'Amount must be a positive integer' };
  }

  const currency = words[2];
  if (!isValidCurrencyFormat(currency)) {
    throw { code: 'SY03', reason: 'Invalid currency format' };
  }

  const credit_account = origWords[5];
  const debit_account = origWords[10];
  if (!debit_account || !credit_account) {
    throw { code: 'SY03', reason: 'Missing account IDs' };
  }

  let execute_by = null;
  const len = words.length;
  if (len === 13 && words[11] === 'on') {
    const date = words[12];
    if (!isValidDateFormat(date)) {
      throw { code: 'DT01', reason: 'Invalid date format' };
    }
    execute_by = date;
  } else if (len !== 11) {
    throw { code: 'SY03', reason: 'Unexpected extra words' };
  }

  return { type: 'CREDIT', amount, currency: currency.toUpperCase(), debit_account, credit_account, execute_by };
}

module.exports = { parseInstruction };