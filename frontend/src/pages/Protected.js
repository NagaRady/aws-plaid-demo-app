import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@aws-amplify/ui-react';
import { getItems as GetItems } from '../graphql/queries';
import Plaid from '../components/Plaid';
import Institutions from '../components/Institutions';

const logger = new ConsoleLogger("Protected");

export default function Protected() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('accounts'); // State to manage active tab
  const client = generateClient();

  const getItems = async () => {
    try {
      const res = await client.graphql({
        query: GetItems
      });
      logger.info(res);
      setItems(res.data.getItems.items);
    } catch (err) {
      logger.error('unable to get items', err);
    }
  }

  useEffect(() => {
    getItems();
  }, []);

  // Tab content rendering based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'accounts':
        return (
          <View>
            <Heading>Institution Accounts Linked</Heading>
            {(items && items.length) ? (
              <Table highlightOnHover={true} size="large" variation="striped">
                <TableHead>
                  <TableRow>
                    <TableCell as="th">Institution Name</TableCell>
                    <TableCell as="th">Account Type</TableCell>
                    <TableCell as="th">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((institution) => (
                    <TableRow key={institution.id}>
                      <TableCell>{institution.name}</TableCell>
                      <TableCell>{institution.type}</TableCell>
                      <TableCell>Manage</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div>No accounts linked</div>
            )}
          </View>
        );
      case 'history':
        return (
          <View>
            <Heading>Payment History</Heading>
            <p>Your payment history will be displayed here.</p>
          </View>
        );
      case 'manageAccount':
        return (
          <View>
            <Plaid getItems={getItems} />
            <Heading>Add/Delete Institution Accounts</Heading>
            {(items && items.length) ? (
              <Institutions institutions={items} />
            ) : (
              <div>No institutions available</div>
            )}
          </View>
        );
      case 'profile':
        return (
          <View>
            <Heading>Your Profile</Heading>
            <p>Your profile information will be displayed here.</p>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Flex direction="column" style={{ padding: '20px', textAlign: 'center' }}>
      <Heading>Welcome to Your Dashboard</Heading>
      
      {/* Tab Buttons */}
      <div className="tabs">
        <Button
          variation={activeTab === 'accounts' ? 'primary' : 'link'}
          onClick={() => setActiveTab('accounts')}
        >
          Accounts Linked
        </Button>
        <Button
          variation={activeTab === 'history' ? 'primary' : 'link'}
          onClick={() => setActiveTab('history')}
        >
          Payment History
        </Button>
        <Button
          variation={activeTab === 'manageAccount' ? 'primary' : 'link'}
          onClick={() => setActiveTab('manageAccount')}
        >
          Add/Delete Account
        </Button>
        <Button
          variation={activeTab === 'profile' ? 'primary' : 'link'}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </Button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderContent()}
      </div>
    </Flex>
  );
}
