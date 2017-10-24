import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql, gql } from 'react-apollo';
import { AuthLayout } from '../components';
import { queries } from '../graphql';

const AuthLayoutContainer = props => {
  const { currentUserQuery } = props;

  if (currentUserQuery.loading) {
    return null;
  }

  const currentUser = currentUserQuery.currentUser;

  if (currentUser) {
    return (window.location.href = '/');
  }

  return <AuthLayout {...props} />;
};

AuthLayoutContainer.propTypes = {
  currentUserQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.currentUser), {
    name: 'currentUserQuery'
  })
)(AuthLayoutContainer);
