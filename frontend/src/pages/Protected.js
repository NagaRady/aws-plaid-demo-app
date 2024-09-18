import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex, Button, Modal, TextField, SelectField } from '@aws-amplify/ui-react';
import { getItems as GetItems } from '../graphql/queries';
import Plaid from '../components/Plaid';
import Institutions from '../components/Institutions';

const logger = new ConsoleLogger("Protected");

export default function Protected() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('accounts'); // Tab management state
  const [showManagePopup, setShowManagePopup] = useState(false); // Show/hide manage popup
  const [selectedCard, setSelectedCard] = useState(null); // State for selected card
  const [payNowPopup, setPayNowPopup] = useState(false); // Show/hide PayNow popup
  const client = generateClient();
  const today = new Date(); // Get today's date

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
    return dueDateObj < today; // Check if due date is before today
  };

  const handleManage = (card) => {
    setSelectedCard(card); // Set the selected card
    setShowManagePopup(true); // Open the manage popup
  };

  const handlePayNow = () => {
    setShowManagePopup(false); // Close the manage popup
    setPayNowPopup(true); // Open the PayNow popup
  };

  // Tab content rendering based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'accounts': // Updated "Upcoming Bills" with card view
        return (
          <View>
            <Heading>Upcoming Bills</Heading>
            {items && items.length ? (
              <Flex direction="row" wrap="wrap" justifyContent="center">
                {items.map((card) => (
                  <View
                    key={card.id}
                    className={`bill-card ${isDueDatePassed(card.dueDate) ? 'greyed-out' : ''}`}
                    style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '10px', width: '250px', backgroundColor: '#f9f9f9' }}
                  >
                    <Heading level={4}>{card.bankTitle}</Heading>
                    <p>Bill Amount: ${card.billAmount}</p>
                    <p>Due Date: {new Date(card.dueDate).toLocaleDateString()}</p>
                    <p>Statement Date: {new Date(card.statementDate).toLocaleDateString()}</p>
                    <Button onClick={() => handleManage(card)} style={{ backgroundColor: '#DAA520', color: 'black' }}>Manage</Button>
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

      {/* Manage Popup */}
      {showManagePopup && selectedCard && (
        <Modal isOpen={showManagePopup} onClose={() => setShowManagePopup(false)}>
          <Heading level={4}>Manage Bill</Heading>
          <p>Choose an action for {selectedCard.bankTitle}</p>
          <Button onClick={handlePayNow}>PayNow</Button>
          <Button>AutoPay</Button>
          <Button>Scheduled</Button>
        </Modal>
      )}

      {/* PayNow Popup */}
      {payNowPopup && selectedCard && (
        <Modal isOpen={payNowPopup} onClose={() => setPayNowPopup(false)}>
          <Heading level={4}>
            {selectedCard.bankTitle} ({selectedCard.mask})
          </Heading>
          <p>Balance Due: ${selectedCard.billAmount}</p>
          <p>Due Date: {new Date(selectedCard.dueDate).toLocaleDateString()}</p>
          <SelectField label="Pay with">
            {/* Dummy list of accounts */}
            <option value="checking">Checking Account - 1234</option>
            <option value="savings">Savings Account - 5678</option>
          </SelectField>
          <Button style={{ backgroundColor: '#DAA520', color: 'black' }}>Confirm Payment</Button>
        </Modal>
      )}
    </Flex>
  );
}
