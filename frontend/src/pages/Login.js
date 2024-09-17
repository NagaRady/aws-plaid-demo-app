import { Authenticator } from '@aws-amplify/ui-react';
import { useAuthenticator, View, Heading, TextField } from '@aws-amplify/ui-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

export default function Login() {
  const { route } = useAuthenticator((context) => [context.route]);
  const location = useLocation();
  const navigate = useNavigate();
  let from = location.state?.from?.pathname || '/';

  // Custom components for the Authenticator
  const components = {
    SignUp: {
      FormFields() {
        return (
          <>
            {/* First Name and Last Name fields added */}
            <TextField
              name="given_name"
              placeholder="First Name"
              label="First Name"
              required
            />
            <TextField
              name="family_name"
              placeholder="Last Name"
              label="Last Name"
              required
            />
            <TextField
              name="username"
              placeholder="Username"
              label="Username"
              required
            />
            <TextField
              name="password"
              type="password"
              placeholder="Password"
              label="Password"
              required
            />
          </>
        );
      },
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
    },
    Header() {
      return (
        <Heading level={3} style={{ fontSize: '1.6rem', fontStyle: 'italic' }}>
          The journey to safe payments begins here {/* Font size set to 1.6rem and italic */}
        </Heading>
      );
    }
  };

  useEffect(() => {
    if (route === 'authenticated') {
      navigate(from, { replace: true });
    }
  }, [route, navigate, from]);

  return (
    <View className="auth-wrapper">
      <Authenticator components={components} />
    </View>
  );
}
