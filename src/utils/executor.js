function execute(parsed, accounts) {
  const { type, amount, currency, debit_account, credit_account, execute_by } = parsed;
  const today = new Date().toISOString().split('T')[0]; // UTC YYYY-MM-DD

  const debitAcc = accounts.find(acc => acc.id === debit_account);
  const creditAcc = accounts.find(acc => acc.id === credit_account);

  const responseAccounts = getInvolvedAccounts(accounts, debit_account, credit_account);

  let status = 'failed';
  let status_code = 'SY03';
  let status_reason = 'Unexpected execution error';

  const isImmediate = execute_by === null || execute_by <= today;

  if (isImmediate) {
    responseAccounts.forEach(acc => {
      if (acc.id === debit_account) {
        acc.balance -= amount;
      } else if (acc.id === credit_account) {
        acc.balance += amount;
      }
    });
    status = 'successful';
    status_code = 'AP00';
    status_reason = 'Transaction executed successfully';
  } else {
    status = 'pending';
    status_code = 'AP02';
    status_reason = 'Transaction scheduled for future execution';
  }

  return {
    type,
    amount,
    currency,
    debit_account,
    credit_account,
    execute_by,
    status,
    status_reason,
    status_code,
    accounts: responseAccounts
  };
}

function getInvolvedAccounts(originalAccounts, debitId, creditId) {
  const involved = originalAccounts.filter(acc => acc.id === debitId || acc.id === creditId);

  return involved.map(acc => ({
    ...acc, 
    balance_before: acc.balance 
  }));
}

function buildFailedResponse(error) {
  return {
    type: null,
    amount: null,
    currency: null,
    debit_account: null,
    credit_account: null,
    execute_by: null,
    status: 'failed',
    status_reason: error.reason || 'Malformed instruction: unable to parse keywords',
    status_code: error.code || 'SY03',
    accounts: []
  };
}

module.exports = { execute, buildFailedResponse };