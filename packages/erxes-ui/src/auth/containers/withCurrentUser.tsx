import * as gq from '../graphql';
import { storeConstantToStore } from '../../utils';
import { CurrentUserQueryResponse } from '../types';
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { IUser } from 'modules/auth/types';
import Spinner from '../../components/Spinner';

type Props = {
  currentUserQuery: CurrentUserQueryResponse;
};

const withCurrentUser = (WrappedComponent) => {
  const Container = (props: Props) => {
    const { loading, data } = useQuery<CurrentUserQueryResponse>(
      gql(gq.currentUser),
      {
        fetchPolicy: 'cache-and-network',
      },
    );

    if (loading || !data) {
      return <Spinner />;
    }

    const currentUser = data ? data.currentUser : ({} as IUser);

    const updatedProps = {
      ...props,
      currentUser,
    };

    if (currentUser) {
      const constants = currentUser.configsConstants || [];

      constants.forEach((c) => storeConstantToStore(c.key, c.values));
    }

    return <WrappedComponent {...updatedProps} />;
  };

  return Container;
};

export default withCurrentUser;
