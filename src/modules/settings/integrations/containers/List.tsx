import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, confirm } from 'modules/common/utils';
import { List } from 'modules/settings/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import { integrationsListParams } from './utils';

const ListContainer = (props: Props) => {
  const {
    totalCountQuery,
    googleAuthQuery,
    removeMutation,
    queryParams
  } = props;

  if (googleAuthQuery.integrationGetGoogleAuthUrl) {
    window.open(googleAuthQuery.integrationGetGoogleAuthUrl, '__blank');
  }

  if (totalCountQuery.loading) {
    return <Spinner />;
  }

  let totalCount = totalCountQuery.integrationsTotalCount.total;

  if (queryParams.kind) {
    totalCount =
      totalCountQuery.integrationsTotalCount.byKind[queryParams.kind];
  }

  const removeIntegration = (integration) => {
    confirm('Are you sure ?').then(() => {
      removeMutation({ variables: { _id: integration._id } })
        .then(() => {
          Alert.success('Congrats');
        })

        .catch(error => {
          Alert.error(error.reason);
        });
    });
  };

  const updatedProps = {
    ...props,
    queryParams,
    totalCount,
    loading: totalCountQuery.loading,

    // TODO: check remove, save, refetch
    remove: removeIntegration,
    save: () => {},
    refetch: () => {},
  };

  return <List {...updatedProps} />;
};

type Props = {
  totalCountQuery: any,
  googleAuthQuery: any,
  removeMutation: (params: { variables: { _id: string } }) => any,
  objects: any,
  queryParams: any
};

export default compose(
  graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' }),
  graphql(
    gql(`
    query integrationGetGoogleAuthUrl {
      integrationGetGoogleAuthUrl
    }
  `),
    { name: 'googleAuthQuery' }
  ),
  graphql(gql(mutations.integrationsRemove), {
    name: 'removeMutation',
    options: ({ queryParams } : { queryParams: any }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.integrations),
            variables: integrationsListParams(queryParams)
          },
          {
            query: gql(queries.integrationTotalCount)
          }
        ]
      };
    }
  })
)(ListContainer);
