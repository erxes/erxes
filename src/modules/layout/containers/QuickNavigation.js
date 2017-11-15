import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { QuickNavigation } from '../components';
import { compose, gql, graphql } from 'react-apollo';
import { queries } from 'modules/notifications/graphql';
import consts from 'consts';

const QuickNavigationContainer = (props, { currentUser }) => {
  const { LOGIN_TOKEN_KEY, LOGIN_REFRESH_TOKEN_KEY } = consts;
  const { notificationCountQuery } = props;

  const logout = () => {
    // remove tokens
    localStorage.removeItem(LOGIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_REFRESH_TOKEN_KEY);

    window.location.href = '/';
  };

  const updatedProps = {
    ...props,

    unreadCount: notificationCountQuery.notificationCounts,
    logout,
    currentUser
  };

  return <QuickNavigation {...updatedProps} />;
};

QuickNavigationContainer.propTypes = {
  history: PropTypes.object,
  notificationCountQuery: PropTypes.object
};

QuickNavigationContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default withRouter(
  compose(
    graphql(gql(queries.notificationCounts), {
      name: 'notificationCountQuery',
      options: () => ({
        variables: {
          requireRead: true
        }
      })
    })
  )(QuickNavigationContainer)
);
