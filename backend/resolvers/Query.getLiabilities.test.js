const { AppSyncClient, EvaluateCodeCommand } = require('@aws-sdk/client-appsync');
const fs = require('fs');

const client = new AppSyncClient({ region: 'us-east-1' });
const file = './Query.getLiabilities.js';
const runtime = {
  name: 'APPSYNC_JS',
  runtimeVersion: '1.0.0',
};
const code = fs.readFileSync(file, { encoding: 'utf8' });

test('validate query liabilities request', async () => {
  const context = JSON.stringify({
    arguments: {
      id: 'item-id',
    },
    identity: {
      sourceIp: ['127.0.0.1'],
      username: 'test-user',
    },
  });

  const params = {
    context,
    code,
    runtime,
    function: 'request',
  };

  const command = new EvaluateCodeCommand(params);

  const response = await client.send(command);
  expect(response.error).toBeUndefined();
  expect(response.evaluationResult).toBeDefined();

  const result = JSON.parse(response.evaluationResult);

  expect(result.query.expressionNames).toHaveProperty('#pk');
  expect(result.query.expressionNames).toHaveProperty('#sk');
  expect(result.query.expressionValues).toHaveProperty(':pk');
  expect(result.query.expressionValues).toHaveProperty(':sk');
});

test('validate query liabilities response', async () => {
  const context = JSON.stringify({
    result: {
      items: [
        {
          account_id: 'account-id',
          last_statement_issue_date: '2020-05-28',
          last_statement_balance: '1708.77',
          next_payment_due_date: '2020-06-28'
        }
      ],
    }
  });

  const params = {
    context,
    code,
    runtime,
    function: 'response',
  };

  const command = new EvaluateCodeCommand(params);

  const response = await client.send(command);
  expect(response.error).toBeUndefined();
  expect(response.evaluationResult).toBeDefined();

  const result = JSON.parse(response.evaluationResult);

  const expected = {
    account_id: 'account-id',
    last_statement_issue_date: '2020-05-28',
    last_statement_balance: '1708.77',
    next_payment_due_date: '2020-06-28'
  };

  expect(result[0]).toEqual(expected);
});
