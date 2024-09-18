#root {
  text-align: center;
  margin: 1.2rem;
}

nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: white;
  padding: 20px;
}

.authenticator {
  background-color: #DAA520;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Position Logout button in the top-right */
.top-right-logout {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

/* Styling for the card view of upcoming bills */
.bill-card {
  border: 1px solid #ccc;
  padding: 20px;
  margin: 10px;
  border-radius: 10px;
  background-color: #f9f9f9;
  width: 250px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.bill-card.greyed-out {
  background-color: #d3d3d3;
  /* Greyed out if due date has passed */
  color: #777;
}

.bill-card h4 {
  margin-bottom: 10px;
}

.bill-card p {
  margin: 5px 0;
}

/* Adjust font size of "Login or Signup!" */
.custom-login-text {
  font-size: 2rem;
  font-weight: bold;
}

/* Styling for the tabs in Protected.js */
.tabs {
  margin-bottom: 20px;
}

.tabs button {
  background-color: #DAA520;
  color: black;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  margin-right: 10px;
  font-size: 16px;
}

.tabs button:hover {
  background-color: lightblue;
}

/* Active tab styling */
.tabs button.active {
  background-color: lightblue;
  color: black;
}

.tab-content {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 10px;
  background-color: #fff;
  margin-top: 20px;
}

/* Plaid button styling */
button {
  background-color: #DAA520;
  color: black;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: lightblue;
}
