import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex, Button } from '@aws-amplify/ui-react';
import { getItems as GetItems } from '../graphql/queries';
import Plaid from '../components/Plaid';
import Institutions from '../components/Institutions';

const logger = new ConsoleLogger("Protected");

export default function Protected() {
  const [state, setState] = useState({
    items: [],
    activeTab: 'accounts',
    openModalIndex: null,
    expandedCardIndex: null,
    paymentMethod: '',
    paymentSpeed: '',
    scheduledItems: [],
    cancelModalIndex: null,
    cancelledIndexes: [],
    openCancelModalIndex: null,
  });

  const client = generateClient();
  const today = useMemo(() => new Date(), []);
  const modalRef = useRef(null);

  const getItems = useCallback(async () => {
    try {
      const res = await client.graphql({ query: GetItems });
      logger.info(res);
      setState((prevState) => ({
        ...prevState,
        items: res.data.getItems.items.map(item => ({ ...item, showPayButton: true })),
      }));
    } catch (err) {
      logger.error('Unable to get items', err);
    }
  }, [client]);

  useEffect(() => {
    getItems();
  }, [getItems]);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setState((prevState) => ({
        ...prevState,
        openModalIndex: null,
        openCancelModalIndex: null,
        expandedCardIndex: null,
        paymentMethod: '',
        paymentSpeed: '',
      }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const isDueDatePassed = useCallback(
    (dueDate) => new Date(dueDate) < today,
    [today]
  );

  const handlePayNow = useCallback(
    (index) => {
      setState((prevState) => ({
        ...prevState,
        openModalIndex: null,
        expandedCardIndex: index,
      }));
    },
    []
  );

  const handlePayIt = useCallback(
    (index) => {
      if (!state.paymentMethod || !state.paymentSpeed) return;

      const itemToSchedule = { ...state.items[index], hasPaid: true, showPayButton: false };
      setState((prevState) => ({
        ...prevState,
        scheduledItems: [...prevState.scheduledItems, itemToSchedule],
        items: prevState.items.map((item, idx) =>
          idx === index ? itemToSchedule : item
        ),
        expandedCardIndex: null,
      }));
    },
    [state.paymentMethod, state.paymentSpeed, state.items]
  );

  const handleConfirmCancel = useCallback(
    (index) => {
      setState((prevState) => ({
        ...prevState,
        cancelledIndexes: [...prevState.cancelledIndexes, index],
        openCancelModalIndex: null,
      }));
    },
    []
  );

  const renderContent = useCallback(() => {
    switch (state.activeTab) {
      case 'accounts':
        return (
          <View>
            <Heading>Upcoming Bills</Heading>
            {state.items && state.items.length ? (
              <Flex direction="row" wrap="wrap" justifyContent="center">
                {state.items.map((card, index) => (
                  <View
                    key={card.id}
                    className={`bill-card ${isDueDatePassed(card.dueDate) ? 'greyed-out' : ''} ${state.expandedCardIndex === index ? 'expanded-card' : ''}`}
                    style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '10px', backgroundColor: '#f9f9f9', position: 'relative' }}
                  >
                    <Heading level={4} style={{ textAlign: 'center' }}>{card.bankTitle}</Heading>
                    <p>Bill Amount: ${card.billAmount}</p>
                    <p>Due Date: {new Date(card.dueDate).toLocaleDateString()}</p>
                    <p>Statement Date: {new Date(card.statementDate).toLocaleDateString()}</p>

                    {card.showPayButton && !card.hasPaid && state.expandedCardIndex !== index && (
                      <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button
                          className="pay-button"
                          onClick={() => setState((prevState) => ({
                            ...prevState,
                            openModalIndex: prevState.openModalIndex === index ? null : index,
                          }))}
                          style={{ backgroundColor: '#DAA520', color: 'black' }}
                        >
                          Pay
                        </Button>
                    )}

                    {state.openModalIndex === index && (
                      <div className="modal" ref={modalRef}>
                        <Button className="small-button" onClick={() => handlePayNow(index)}>PayNow</Button>
                        <Button className="small-button">AutoPay</Button>
                      </div>
                    )}

                    {state.expandedCardIndex === index && (
                      <Flex className="payment-options" style={{ marginTop: '10px', alignItems: 'center', gap: '10px' }}>
                        <label>
                          Select Payment Method:
                          <select value={state.paymentMethod} onChange={(e) => setState((prevState) => ({ ...prevState, paymentMethod: e.target.value }))}>
                            <option value="">Select</option>
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                          </select>
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="paymentSpeed"
                            value="standard"
                            checked={state.paymentSpeed === 'standard'}
                            onChange={(e) => setState((prevState) => ({ ...prevState, paymentSpeed: 'standard' }))}
                          />
                          Standard (3-4 days)
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="paymentSpeed"
                            value="expedited"
                            checked={state.paymentSpeed === 'expedited'}
                            onChange={(e) => setState((prevState) => ({ ...prevState, paymentSpeed: 'expedited' }))}
                          />
                          Expedited (7-10 days)
                        </label>
                        <Button
                          className="pay-it-button"
                          onClick={() => handlePayIt(index)}
                          disabled={!state.paymentMethod || !state.paymentSpeed}
                          style={{ padding: '10px 20px', fontSize: '16px' }}
                        >
                          PayIt
                        </Button>
                      </Flex>
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
            {state.scheduledItems && state.scheduledItems.length ? (
              <Flex direction="row" wrap="wrap" justifyContent="center">
                {state.scheduledItems.map((card, index) => (
                  <View key={card.id}
                    className={`bill-card ${isDueDatePassed(card.dueDate) ? 'greyed-out' : ''}`}
                    style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '10px', backgroundColor: '#f9f9f9', position: 'relative' }}
                  >
                    <Heading level={4} style={{ textAlign: 'center' }}>{card.bankTitle}</Heading>
                    <p>Bill Amount: ${card.billAmount}</p>
                    <p>Due Date: {new Date(card.dueDate).toLocaleDateString()}</p>
                    <p>Statement Date: {new Date(card.statementDate).toLocaleDateString()}</p>
                    {state.cancelledIndexes.includes(index) ? (
                      <p>Cancelled</p>
                    ) : (
                      <Button
                        onClick={() => setState(prevState => ({
                          ...prevState,
                          openCancelModalIndex: index
                        }))}
                        style={{ backgroundColor: 'red', color: 'white' }}>
                        Cancel
                      </Button>
                    )}

                    {state.openCancelModalIndex === index && (
                      <div className="modal" ref={modalRef}>
                        <Button className="small-button" onClick={() => handleConfirmCancel(index)}>Confirm</Button>
                        <Button className="small-button" onClick={() => setState(prevState => ({
                          ...prevState,
                          openCancelModalIndex: null
                        }))}>
                          Nevermind
                        </Button>
                      </div>
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
            {state.items && state.items.length ? (
              <Institutions institutions={state.items} />
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
  }, [state, handlePayNow, handlePayIt, isDueDatePassed, getItems, handleConfirmCancel]);

  return (
    <Flex direction="column" style={{ padding: '20px', textAlign: 'center' }}>
      <Heading>Your Dashboard</Heading>
      
      <div className="tabs">
        {['accounts', 'scheduledBills', 'history', 'manageAccount', 'profile'].map((tab) => (
          <Button
            key={tab}
            className={state.activeTab === tab ? 'active' : ''}
            onClick={() => setState((prevState) => ({ ...prevState, activeTab: tab }))}
          >
            {tab === 'accounts' ? 'Upcoming Bills' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <div className="tab-content">
        {renderContent()}
      </div>
    </Flex>
  );
}
