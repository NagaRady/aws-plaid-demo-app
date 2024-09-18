import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex, Button } from '@aws-amplify/ui-react';
import { getItems as GetItems } from '../graphql/queries';
import Plaid from '../components/Plaid';
import Institutions from '../components/Institutions';

const logger = new ConsoleLogger("Protected");

export default function Protected() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('accounts');
  const [showPopup, setShowPopup] = useState(null);  // Track which card's popup is active
  const client = generateClient();
  const today = new Date();

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
  };

  useEffect(() => {
    getItems();
  }, []);

  const isDueDatePassed = (dueDate) => {
    const dueDateObj = new Date(dueDate);
    return dueDateObj < today;
  };

  const handleManageClick = (id) => {
    if (showPopup === id) {
      setShowPopup(null);  // Close popup if clicking the same manage button again
    } else {
      setShowPopup(id);  // Open the popup for the clicked card
    }
  };

  const closePopup = () => {
    setShowPopup(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'accounts':
        return (
          <View>
            <Heading>Upcoming Bills</Heading>
            {items && items.length ? (
              <Flex direction="row" wrap="wrap" justifyContent="center">
                {items.map((card) => (
                  <View
                    key={card.id}
                    className={`bill-card ${isDueDatePassed(card.dueDate) ? 'greyed-out' : ''}`}
                    style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '10px', width: '250px', backgroundColor: '#f9f9f9', position: 'relative' }}
                  >
                    <Heading level={4}>{card.bankTitle}</Heading>
                    <p>Bill Amount: ${card.billAmount}</p>
                    <p>Due Date: {new Date(card.dueDate).toLocaleDateString()}</p>
                    <p>Statement Date: {new Date(card.statementDate).toLocaleDateString()}</p>
                    <Button style={{ backgroundColor: '#DAA520', color: 'black' }} onClick={() => handleManageClick(card.id)}>
                      Manage
                    </Button>

                    {/* Modal for Manage Button */}
                    {showPopup === card.id && (
                      <div className="modal">
                        <div className="modal-header">Manage Options</div>
                        <div className="modal-row">
                          <Button className="modal-button" onClick={closePopup}>PayNow</Button>
                          <Button className="modal-button" onClick={closePopup}>AutoPay</Button>
                          <Button className="modal-button" onClick={closePopup}>Scheduled</Button>
                        </div>
                        <Button className="modal-button" onClick={closePopup}>Close</Button>
                      </div>
                    )}
                  </View>
                ))}
              </Flex>
            ) : (
              <div>No upcoming bills</div>
            )}
          </View>
        );
      case 'scheduledBills':
        return (
          <View>
            <Heading>Scheduled Bills</Heading>
            <p>Your scheduled bills will be displayed here.</p>
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
            {items && items.length ? (
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
      <Heading>Your Dashboard</Heading>

      {/* Tab Buttons */}
      <div className="tabs">
        <Button
          className={activeTab === 'accounts' ? 'active' : ''}
          onClick={() => setActiveTab('accounts')}
        >
          Upcoming Bills
        </Button>
        <Button
          className={activeTab === 'scheduledBills' ? 'active' : ''}
          onClick={() => setActiveTab('scheduledBills')}
        >
          Scheduled Bills
        </Button>
        <Button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Payment History
        </Button>
        <Button
          className={activeTab === 'manageAccount' ? 'active' : ''}
          onClick={() => setActiveTab('manageAccount')}
        >
          Add/Delete Account
        </Button>
        <Button
          className={activeTab === 'profile' ? 'active' : ''}
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
