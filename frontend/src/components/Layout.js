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
      {/* Apply a custom class to adjust the font size for the heading */}
      <Heading level={2} className="custom-heading">
        The journey to safe payments begins here
      </Heading>  
      
      {/* Apply a custom class to adjust the font size for the login/signup message */}
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
