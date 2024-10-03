import { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { getLiabilities } from '../graphql/queries';
import { View, Table, Text } from '@aws-amplify/ui-react';

function Liabilities({ id, accounts }) {
  const [liabilities, setLiabilities] = useState([]);

  useEffect(() => {
    fetchLiabilities();
  }, [id]); // Dependency array includes id to refetch when the institution id changes

  const fetchLiabilities = async () => {
    try {
      const liabilityData = await API.graphql(graphqlOperation(getLiabilities, { id }));
      const { data: { getLiabilities: { credit } } } = liabilityData;
      setLiabilities(credit);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
      setLiabilities([]);
    }
  };

  return (
    <View>
      <Text variant="primary">Credit Card Liabilities</Text>
      <Table>
        <thead>
          <tr>
            <th>Account ID</th>
            <th>Last Statement Issue Date</th>
            <th>Last Statement Balance</th>
            <th>Next Payment Due Date</th>
          </tr>
        </thead>
        <tbody>
          {liabilities.map((liability, idx) => (
            <tr key={idx}>
              <td>{accounts[liability.account_id]?.name || liability.account_id}</td>
              <td>{liability.last_statement_issue_date}</td>
              <td>${liability.last_statement_balance}</td>
              <td>{liability.next_payment_due_date}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </View>
  );
}

export default Liabilities;
