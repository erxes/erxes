import client from 'apolloClient';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { queries as authQueries } from '../../../../auth/graphql';
import { CurrentUserQueryResponse } from '../../../../auth/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '../../../../common/utils';
import Expired from '../components/Expired';
import withCurrentOrganization from '@erxes/ui-settings/src/general/saas/containers/withCurrentOrganization';

type Props = {
  totalCountQuery: any;
  currentUserQuery: CurrentUserQueryResponse;
  currentOrganization: any;
};

const ExpiredContainer = (props: Props) => {
  const { totalCountQuery, currentUserQuery } = props;

  if (currentUserQuery.loading) {
    return null;
  }

  const logout = () => {
    client
      .mutate({
        mutation: gql`
          mutation {
            logout
          }
        `,
      })

      .then(() => {
        window.location.href = '/';
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    logout,
    usersTotalCount: totalCountQuery.usersTotalCount || 0,
  };

  const currentUser = currentUserQuery.currentUser;

  return <Expired {...updatedProps} currentUser={currentUser} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, {}>(
      gql`
        query usersTotalCount {
          usersTotalCount
        }
      `,
      { name: 'totalCountQuery' },
    ),
    graphql<{}, CurrentUserQueryResponse>(gql(authQueries.currentUser), {
      name: 'currentUserQuery',
      options: {
        fetchPolicy: 'network-only',
      },
    }),
  )(withCurrentOrganization(ExpiredContainer)),
);
