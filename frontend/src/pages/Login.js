import { Authenticator } from '@aws-amplify/ui-react';
import { useAuthenticator, View, Heading, Text } from '@aws-amplify/ui-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

export default function Login() {
  const { route } = useAuthenticator((context) => [context.route]);
  const location = useLocation();
  const navigate = useNavigate();
  let from = location.state?.from?.pathname || '/';

  // Custom components for Authenticator
  const components = {
    Header() {
      return (
        <Heading level={3}>
          The journey to safe payments begins here {/* Replaced the old text */}
        </Heading>
      );
    },
    SignIn: {
      Header() {
        return (
          <Heading level={3}>Login or Signup!</Heading> {/* Replaced "Please login!" */}
        );
      }
    },
    SignUp: {
      Footer() {
        return (
          <View textAlign="center">
            <strong>Password Policy</strong>:
            <ul>
              <li>Minimum of 8 characters</li>
              <li>At least one lowercase character</li>
              <li>At least one uppercase character</li>
              <li>At least one number character</li>
              <li>At least one symbol character</li>
            </ul>
          </View>
        );
      }
    }
  };

  useEffect(() => {
    if (route === 'authenticated') {
      navigate(from, { replace: true });
    }
  }, [route, navigate, from]);

  return (
    <View className="auth-wrapper">
      <Authenticator components={components}/>
    </View>
  );
}
