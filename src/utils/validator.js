function validate(parsed, accounts) {
  const { amount, currency, debit_account, credit_account, execute_by } = parsed;
  const today = new Date().toISOString().split('T')[0]; // UTC YYYY-MM-DD

  if (!Number.isInteger(amount) || amount <= 0) {
    return { valid: false, code: 'AM01', reason: 'Amount must be a positive integer' };
  }
  const supportedCurrencies = ['NGN', 'USD', 'GBP', 'GHS'];
  if (!supportedCurrencies.includes(currency)) {
    return { valid: false, code: 'CU02', reason: `Unsupported currency. Only NGN, USD, GBP, and GHS are supported` };
  }

  const debitAcc = accounts.find(acc => acc.id === debit_account);
  const creditAcc = accounts.find(acc => acc.id === credit_account);
  if (!debitAcc) {
    return { valid: false, code: 'AC03', reason: `Account not found: ${debit_account}` };
  }
  if (!creditAcc) {
    return { valid: false, code: 'AC03', reason: `Account not found: ${credit_account}` };
  }
  if (debit_account === credit_account) {
    return { valid: false, code: 'AC02', reason: 'Debit and credit accounts cannot be the same' };
  }

  // Currency: Match between instruction and accounts
  if (debitAcc.currency.toUpperCase() !== currency || creditAcc.currency.toUpperCase() !== currency) {
    return { valid: false, code: 'CU01', reason: 'Account currency mismatch' };
  }

  // Account IDs: Valid characters (alphanum, -, ., @)
  if (!isValidAccountId(debit_account) || !isValidAccountId(credit_account)) {
    return { valid: false, code: 'AC04', reason: 'Invalid account ID format' };
  }

  // Date: Full validation if present
  if (execute_by && !isFullyValidDate(execute_by)) {
    return { valid: false, code: 'DT01', reason: 'Invalid date format or value' };
  }

  // Funds: Only for immediate execution
  if (execute_by === null || execute_by <= today) {
    if (debitAcc.balance < amount) {
      return { valid: false, code: 'AC01', reason: `Insufficient funds in debit account ${debit_account}: has ${debitAcc.balance} ${currency}, needs ${amount} ${currency}` };
    }
  }

  return { valid: true };
}

function isValidAccountId(id) {
  if (!id || id.length === 0) return false;
  for (let i = 0; i < id.length; i++) {
    const c = id.charAt(i);
    if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '-' || c === '.' || c === '@')) {
      return false;
    }
  }
  return true;
}

function isFullyValidDate(dateStr) {
  if (dateStr.length !== 10 || dateStr.charAt(4) !== '-' || dateStr.charAt(7) !== '-') return false;
  const yearStr = dateStr.substring(0, 4);
  const monthStr = dateStr.substring(5, 7);
  const dayStr = dateStr.substring(8, 10);
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1000 || year > 3000) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
}

module.exports = { validate };