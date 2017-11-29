import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql, gql } from 'react-apollo';
import { queries } from '../graphql';

const withCurrentUser = Component => {
  const Container = props => {
    const { currentUserQuery } = props;

    if (currentUserQuery.loading) {
      return null;
    }

    const updatedProps = {
      ...props,
      currentUser: currentUserQuery.currentUser
    };

    return <Component {...updatedProps} />;
  };

  Container.propTypes = {
    currentUserQuery: PropTypes.object
  };

  return compose(
    graphql(gql(queries.currentUser), {
      name: 'currentUserQuery'
    })
  )(Container);
};

export default withCurrentUser;
