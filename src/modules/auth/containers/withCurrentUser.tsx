import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { CurrentUserQueryResponse } from '../types';

type Props = {
  currentUserQuery: CurrentUserQueryResponse;
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

  return withProps<{}>(
    compose(
      graphql<{}, CurrentUserQueryResponse>(gql(queries.currentUser), {
        name: 'currentUserQuery'
      })
    )(Container)
  );
};

export default withCurrentUser;
