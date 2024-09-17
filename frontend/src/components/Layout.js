import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthenticator, View, Text, Button } from '@aws-amplify/ui-react';

export default function Layout() {
  const { route, signOut, user } = useAuthenticator((context) => [
    context.route,
    context.signOut,
    context.user
  ]);
  const navigate = useNavigate();

  function logOut() {
    signOut();
    navigate('/login');
  }

  return (
    <>
      {/* Logout button positioned in the top-right */}
      <div className="top-right-logout">
        <Button onClick={logOut}>Logout</Button>
      </div>
      
      {/* Display the login/signup message or welcome message based on authentication */}
      <View>
        <Text className="custom-login-text">
          {route === 'authenticated'
            ? `Welcome ${user.signInDetails?.loginId}`
            : 'Login or Signup!'}
        </Text>
      </View>

      <Outlet />
    </>
  );
}