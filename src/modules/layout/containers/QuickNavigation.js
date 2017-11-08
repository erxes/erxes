import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { QuickNavigation } from '../components';
import consts from 'consts';

const QuickNavigationContainer = (props, { currentUser }) => {
  const { LOGIN_TOKEN_KEY, LOGIN_REFRESH_TOKEN_KEY } = consts;

  const logout = () => {
    // remove tokens
    localStorage.removeItem(LOGIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_REFRESH_TOKEN_KEY);

    window.location.href = '/';
  };

  const updatedProps = { ...props, logout, currentUser };

  return <QuickNavigation {...updatedProps} />;
};

QuickNavigationContainer.propTypes = {
  history: PropTypes.object
};

QuickNavigationContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default withRouter(QuickNavigationContainer);
