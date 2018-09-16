import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';

type Props = {
  currentUserQuery: any
};

const withCurrentUser = Component => {
  const Container = (props: Props) => {
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

  return compose(
    graphql(gql(queries.currentUser), {
      name: 'currentUserQuery'
    })
  )(Container);
};

export default withCurrentUser;
