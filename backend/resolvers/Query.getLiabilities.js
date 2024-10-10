import { util } from '@aws-appsync/utils';

/**
 * Query DynamoDB for liabilities for a given user
 *
 * @param ctx the request context
 */
export function request(ctx) {
  const { id } = ctx.arguments;
  const { username } = ctx.identity;

  return {
    operation: 'Query',
    query: {
      expression: '#pk = :pk AND begins_with(#sk, :sk)',
      expressionNames: {
        '#pk': 'pk',
        '#sk': 'sk',
      },
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `USER#${username}#ITEM#${id}`,
        ':sk': 'LIABILITY#CREDITCARD#',
      }),
    },
    limit: 100,
  };
}

/**
 * Returns the DynamoDB result
 *
 * @param ctx the request context
 */
export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    console.log("DynamoDB Error:", error);
    return util.appendError("Failed to fetch liabilities due to backend error", "LiabilityFetchError", result);
  }

  const liabilities = result.items.map((item) => ({
    account_id: item.account_id,
    last_statement_issue_date: item.last_statement_issue_date,
    last_statement_balance: item.last_statement_balance,
    next_payment_due_date: item.next_payment_due_date
  }));

  return liabilities;
}
