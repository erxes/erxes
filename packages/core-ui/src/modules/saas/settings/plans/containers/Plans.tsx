import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { queries as authQueries } from '../../../../auth/graphql';
import { CurrentUserQueryResponse } from '../../../../auth/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '../../../../common/utils';
import Plans from '../components/Plans';
import withCurrentOrganization from '@erxes/ui-settings/src/general/saas/containers/withCurrentOrganization';

type Props = {
  totalCountQuery: any;
  currentUserQuery: CurrentUserQueryResponse;
  currentOrganization: any;
};

const PlansContainer = (props: Props) => {
  const { totalCountQuery, currentUserQuery } = props;

  if (currentUserQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    usersTotalCount: totalCountQuery.usersTotalCount || 0,
  };

  const currentUser = currentUserQuery.currentUser;

  return <Plans {...updatedProps} currentUser={currentUser} />;
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
  )(withCurrentOrganization(PlansContainer)),
);
