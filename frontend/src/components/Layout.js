import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthenticator, Heading, View, Text } from '@aws-amplify/ui-react';

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
      {/* Conditionally display the heading only when the user is NOT authenticated */}
      {route !== 'authenticated' && (
        <Heading level={2} className="custom-heading">
          The journey to safe payments begins here
        </Heading>
      )}

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
