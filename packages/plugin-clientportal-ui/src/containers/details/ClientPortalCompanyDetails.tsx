import { IUser } from '@erxes/ui/src/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import ClientPortalCompanyDetails from '../../components/detail/ClientPortalCompanyDetails';
import { queries } from '../../graphql';
import { ClientPoratlUserDetailQueryResponse } from '../../types';

type Props = {
  id: string;
  history: any;
};

type FinalProps = {
  clientPortalUserDetailQuery: ClientPoratlUserDetailQueryResponse;
  currentUser: IUser;
} & Props;

function CompanyDetailsContainer(props: FinalProps) {
  const { id, clientPortalUserDetailQuery, currentUser } = props;

  if (clientPortalUserDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!clientPortalUserDetailQuery.clientPortalUserDetail) {
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
      clientPortalUserDetailQuery.clientPortalUserDetail || ({} as any),
    currentUser
  };

  return <ClientPortalCompanyDetails {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props, ClientPoratlUserDetailQueryResponse, { _id: string }>(
      gql(queries.clientPortalUserDetail),
      {
        name: 'clientPortalUserDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    )
  )(CompanyDetailsContainer)
);
