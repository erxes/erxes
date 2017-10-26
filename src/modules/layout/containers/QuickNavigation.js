import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { QuickNavigation } from '../components';
import apolloClient from 'apolloClient';
import consts from 'consts';

const QuickNavigationContainer = props => {
  const { history } = props;

  const { LOGIN_TOKEN_KEY, LOGIN_REFRESH_TOKEN_KEY } = consts;

  const logout = () => {
    // reset apollo store
    apolloClient.resetStore();

    // remove tokens
    localStorage.removeItem(LOGIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_REFRESH_TOKEN_KEY);

    // redirect
    history.push('/');
  };

  const updatedProps = { ...props, logout };

  return <QuickNavigation {...updatedProps} />;
};

QuickNavigationContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(QuickNavigationContainer);
