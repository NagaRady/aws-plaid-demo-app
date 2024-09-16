import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthenticator, Heading, View } from '@aws-amplify/ui-react';

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
      {/* Remove the entire nav section to get rid of Home and Login buttons */}
      {/* <nav>
        <Button onClick={() => navigate('/')}>Home</Button>
        {route !== 'authenticated' ? (
          <Button onClick={() => navigate('/login')}>Login</Button>
        ) : (
          <Button onClick={() => logOut()}>Logout</Button>
        )}
      </nav> */}
      
      {/* Replace "Plaid AWS Quickstart" and "Please Login!" text */}
      <Heading level={2}>The journey to safe payments begins here</Heading>  
      <View>
        {route === 'authenticated'
          ? `Welcome ${user.signInDetails?.loginId}`
          : 'Login or Signup!'}
      </View>

      <Outlet />
    </>
  );
}
