import { useState, useEffect, useRef } from 'react';
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
  const [openModalIndex, setOpenModalIndex] = useState(null); // For pay modal in "Upcoming Bills"
  const [scheduledItems, setScheduledItems] = useState([]); // For cards in "Scheduled Bills"
  const [cancelModalIndex, setCancelModalIndex] = useState(null); // For cancel popup in "Scheduled Bills"
  const [cancelledIndexes, setCancelledIndexes] = useState([]); // Track cancelled cards
  const client = generateClient();
  const today = new Date();
  const modalRef = useRef(null);

  // Fetch the items
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModalIndex(null); // Close pay modal
        setCancelModalIndex(null); // Close cancel modal
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isDueDatePassed = (dueDate) => {
    const dueDateObj = new Date(dueDate);
    return dueDateObj < today;
  };

  // Handle PayIt functionality
  const handlePayIt = (index) => {
    const itemToSchedule = items[index];
    setScheduledItems((prev) => [...prev, itemToSchedule]);
    setItems((prevItems) => prevItems.filter((_, i) => i !== index)); // Remove paid card from "Upcoming Bills"
    setOpenModalIndex(null); // Close the pay modal
  };

  // Handle cancel button click
  const handleCancel = (index) => {
    setCancelModalIndex(index); // Open the cancel confirmation popup
  };

  // Handle confirm cancellation
  const handleConfirmCancel = (index) => {
    setCancelledIndexes((prev) => [...prev, index]); // Mark card as cancelled
    setCancelModalIndex(null); // Close the cancel modal
  };

  // Render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'accounts':
        return (
          <View>
            <Heading>Upcoming Bills</Heading>
            {items && items.length ? (
              <Flex direction="row" wrap="wrap" justifyContent="center">
                {items.map((card, index) => (
                  <View
                    key={card.id}
                    className={`bill-card ${isDueDatePassed(card.dueDate) ? 'greyed-out' : ''}`}
                    style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '10px', width: '250px', backgroundColor: '#f9f9f9', position: 'relative' }}
                  >
                    <Heading level={4} style={{ textAlign: 'center' }}>
                      {card.bankTitle}
                    </Heading>
                    <p>Bill Amount: ${card.billAmount}</p>
                    <p>Due Date: {new Date(card.dueDate).toLocaleDateString()}</p>
                    <p>Statement Date: {new Date(card.statementDate).toLocaleDateString()}</p>
                    
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <Button
                        className="pay-button"
                        onClick={() => setOpenModalIndex(openModalIndex === index ? null : index)}
                        style={{ backgroundColor: '#DAA520', color: 'black' }}
                      >
                        Pay
                      </Button>

                      {openModalIndex === index && (
                        <div className="modal" ref={modalRef}>
                          <Button className="small-button" onClick={() => handlePayIt(index)}>PayNow</Button>
                          <Button className="small-button">AutoPay</Button>
                        </div>
                      )}
                    </div>
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
            {scheduledItems && scheduledItems.length ? (
              <Flex direction="row" wrap="wrap" justifyContent="center">
                {scheduledItems.map((card, index) => (
                  <View
                    key={card.id}
                    className="bill-card"
                    style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '10px', width: '250px', backgroundColor: '#f9f9f9', position: 'relative' }}
                  >
                    <Heading level={4} style={{ textAlign: 'center' }}>
                      {card.bankTitle}
                    </Heading>
                    <p>Bill Amount: ${card.billAmount}</p>
                    <p>Due Date: {new Date(card.dueDate).toLocaleDateString()}</p>
                    <p>Statement Date: {new Date(card.statementDate).toLocaleDateString()}</p>
                    
                    {!cancelledIndexes.includes(index) ? (
                      <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button
                          className="cancel-button"
                          onClick={() => handleCancel(index)}
                          style={{ backgroundColor: 'red', color: 'white' }}
                        >
                          Cancel
                        </Button>

                        {cancelModalIndex === index && (
                          <div className="modal" ref={modalRef}>
                            <Button className="small-button" onClick={() => handleConfirmCancel(index)}>Confirm</Button>
                            <Button className="small-button" onClick={() => setCancelModalIndex(null)}>Nevermind</Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', color: 'green' }}>Cancelled</p>
                    )}
                  </View>
                ))}
              </Flex>
            ) : (
              <div>No scheduled bills</div>
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

      <div className="tab-content">
        {renderContent()}
      </div>
    </Flex>
  );
}
