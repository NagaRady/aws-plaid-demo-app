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
  const [openModalIndex, setOpenModalIndex] = useState(null); // Track clicked Pay button
  const [expandedCardIndex, setExpandedCardIndex] = useState(null); // Track expanded card
  const client = generateClient();
  const today = new Date();
  const modalRef = useRef(null); // Reference to the modal

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

  // Close the modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModalIndex(null);
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

  const handlePayNowClick = (index) => {
    setExpandedCardIndex(index); // Expand the clicked card
    setOpenModalIndex(null); // Close the modal
  };

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
                    className={`bill-card ${isDueDatePassed(card.dueDate) ? 'greyed-out' : ''} ${expandedCardIndex === index ? 'expanded-card' : ''}`}
                    style={{
                      padding: '20px',
                      border: '1px solid #ccc',
                      margin: '10px',
                      borderRadius: '10px',
                      backgroundColor: '#f9f9f9',
                      position: 'relative',
                      width: expandedCardIndex === index ? '80%' : '250px', // Expanded width for the clicked card
                      height: expandedCardIndex === index ? 'auto' : 'auto' // Expand height if needed
                    }}
                  >
                    <Heading level={4} style={{ textAlign: 'center' }}>
                      {card.bankTitle}
                    </Heading>
                    <p>Bill Amount: ${card.billAmount}</p>
                    <p>Due Date: {new Date(card.dueDate).toLocaleDateString()}</p>
                    <p>Statement Date: {new Date(card.statementDate).toLocaleDateString()}</p>
                    
                    {/* Pay button in footer center */}
                    {!expandedCardIndex === index && (
                      <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button
                          className="pay-button"
                          onClick={() => setOpenModalIndex(openModalIndex === index ? null : index)} // Toggle modal
                          style={{ backgroundColor: '#DAA520', color: 'black' }}
                        >
                          Pay
                        </Button>

                        {/* Show the modal only for the clicked Pay button */}
                        {openModalIndex === index && (
                          <div className="modal" ref={modalRef}>
                            <Button className="small-button" onClick={() => handlePayNowClick(index)}>PayNow</Button>
                            <Button className="small-button">AutoPay</Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expanded card options */}
                    {expandedCardIndex === index && (
                      <div className="expanded-payment-options">
                        <label>
                          Select Payment Method:
                          <select>
                            <option>Checking</option>
                            <option>Savings</option>
                          </select>
                        </label>

                        <div>
                          <label>
                            <input type="radio" name="payment-speed" value="standard" /> Standard (3-4 days)
                          </label>
                          <label style={{ marginLeft: '10px' }}>
                            <input type="radio" name="payment-speed" value="expedited" /> Expedited (7-10 days)
                          </label>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                          <Button className="pay-it-button">Pay It</Button>
                        </div>
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
