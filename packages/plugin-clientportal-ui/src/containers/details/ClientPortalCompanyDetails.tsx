import { IUser } from '@erxes/ui/src/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import React from 'react';

import ClientPortalCompanyDetails from '../../components/detail/ClientPortalCompanyDetails';
import { queries } from '../../graphql';
import { ClientPoratlUserDetailQueryResponse } from '../../types';
import { useQuery } from '@apollo/client';

type Props = {
  id: string;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

function CompanyDetailsContainer(props: FinalProps) {
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

  return <ClientPortalCompanyDetails {...updatedProps} />;
}

export default CompanyDetailsContainer;
