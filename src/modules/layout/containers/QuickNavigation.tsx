import consts from 'consts';
import * as React from 'react';
import { withCurrentUser } from '../../auth/containers';
import { IUser } from '../../auth/types';
import { QuickNavigation } from '../components';

const QuickNavigationContainer = (props: { currentUser: IUser }) => {
  const { LOGIN_TOKEN_KEY, LOGIN_REFRESH_TOKEN_KEY } = consts;

  const logout = () => {
    // remove tokens
    localStorage.removeItem(LOGIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_REFRESH_TOKEN_KEY);

    window.location.href = '/';
  };

  return (
    <QuickNavigation
      {...props}
      logout={logout}
    />
  )
};

export default withCurrentUser(QuickNavigationContainer);