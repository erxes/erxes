import { AppConsumer } from 'appContext';
import consts from 'consts';
import * as React from 'react';
import { QuickNavigation } from '../components';

const QuickNavigationContainer = props => {
  const { LOGIN_TOKEN_KEY, LOGIN_REFRESH_TOKEN_KEY } = consts;

  const logout = () => {
    // remove tokens
    localStorage.removeItem(LOGIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_REFRESH_TOKEN_KEY);

    window.location.href = '/';
  };

  return (
    <AppConsumer>
      {({ currentUser }) => (
        <QuickNavigation {...props} logout={logout} currentUser={currentUser} />
      )}
    </AppConsumer>
  );
};

export default QuickNavigationContainer;
