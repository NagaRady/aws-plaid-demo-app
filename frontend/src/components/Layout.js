import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthenticator, View, Text } from '@aws-amplify/ui-react';

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
      {/* Display the login/signup message with adjusted font size */}
      <View>
        <Text style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {route === 'authenticated'
            ? `Welcome ${user.signInDetails?.loginId}`
            : 'Login or Signup!'} {/* Font size increased to match the previous size of "The journey to safe payments begins here" */}
        </Text>
      </View>

      <Outlet />
    </>
  );
}
