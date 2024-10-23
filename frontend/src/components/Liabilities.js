import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { Table, TableRow, TableCell, Loader } from '@aws-amplify/ui-react';
import { getLiabilities as GetLiabilities } from '../graphql/queries';

const logger = new ConsoleLogger("Liabilities");


export default function Liabilities({ id }) {
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const client = generateClient();

  const fetchLiabilities = async () => {
    setLoading(true);
    try {
      const res = await client.graphql({
        query: GetLiabilities,
        variables: { id }
      });
      setLiabilities(res.data.getLiabilities);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiabilities();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <p>Error fetching liabilities: {error.message}</p>;

  return (
    <Table highlightOnHover={true} variation="striped">
      <thead>
        <TableRow>
          <TableCell as="th">Account ID</TableCell>
          <TableCell as="th">Last Statement Issue Date</TableCell>
          <TableCell as="th">Last Statement Balance</TableCell>
          <TableCell as="th">Next Payment Due Date</TableCell>
        </TableRow>
      </thead>
      <tbody>
        {liabilities.map(liability => (
          <TableRow key={liability.credit.account_id}>
            <TableCell>{liability.credit.account_id}</TableCell>
            <TableCell>{liability.credit.last_statement_issue_date}</TableCell>
            <TableCell>${liability.credit.last_statement_balance}</TableCell>
            <TableCell>{liability.credit.next_payment_due_date}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
