import { IUser } from '@erxes/ui/src/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import React from 'react';

import ClientPortalUserDetail from '../../components/detail/ClientPortalUserDetails';
import { queries } from '../../graphql';
import { ClientPoratlUserDetailQueryResponse } from '../../types';
import { useQuery } from '@apollo/client';

type Props = {
  id: string;
  queryParams?: any;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

function CustomerDetailsContainer(props: FinalProps) {
  const { id, currentUser } = props;

  const clientPortalUserDetailQuery =
    useQuery<ClientPoratlUserDetailQueryResponse>(
      gql(queries.clientPortalUserDetail),
      {
        variables: {
          _id: id,
        },
      },
    );

  if (clientPortalUserDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (
    clientPortalUserDetailQuery.data === undefined ||
    !clientPortalUserDetailQuery.data.clientPortalUserDetail
  ) {
    return (
      <EmptyState
        text="ClientPortal User not found"
        image="/images/actions/17.svg"
      />
    );
  }

  const updatedProps = {
    ...props,
    clientPortalUser:
      (clientPortalUserDetailQuery.data &&
        clientPortalUserDetailQuery.data.clientPortalUserDetail) ||
      ({} as any),
    currentUser,
  };

  return <ClientPortalUserDetail {...updatedProps} />;
}

export default CustomerDetailsContainer;
