import React from 'react';
import PropTypes from 'prop-types';
import { QuickNavigation } from '../components';
import consts from 'consts';

const QuickNavigationContainer = props => {
  const { LOGIN_TOKEN_KEY, LOGIN_REFRESH_TOKEN_KEY } = consts;

  const logout = () => {
    // remove tokens
    localStorage.removeItem(LOGIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_REFRESH_TOKEN_KEY);

    window.location.href = '/';
  };

  const updatedProps = {
    ...props,
    logout
  };

  return <QuickNavigation {...updatedProps} />;
};

QuickNavigationContainer.propTypes = {
  history: PropTypes.object
};

export default QuickNavigationContainer;
