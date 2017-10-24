import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql, gql } from 'react-apollo';
import { MainLayout } from '../components';
import { queries } from '../graphql';

const MainLayoutContainer = props => {
  const { currentUserQuery } = props;

  if (currentUserQuery.loading) {
    return null;
  }

  const currentUser = currentUserQuery.currentUser;

  if (!currentUser) {
    return (window.location.href = '/sign-in');
  }

  return <MainLayout {...props} />;
};

MainLayoutContainer.propTypes = {
  currentUserQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.currentUser), {
    name: 'currentUserQuery'
  })
)(MainLayoutContainer);
