import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, confirm } from 'modules/common/utils';
import { IntegrationList } from 'modules/settings/integrations/components/common';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { integrationsListParams } from '../utils';

const IntegrationListContainer = (props: Props) => {
  const { integrationsQuery, removeMutation } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective />;
  }

  const integrations = integrationsQuery.integrations || [];

  const removeIntegration = (integration, callback) => {
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
    integrations,
    removeIntegration,
    loading: integrationsQuery.loading
  };

  return <IntegrationList {...updatedProps} />;
};

type Props = {
  integrationsQuery: any,
  removeMutation: any
};

type QueryProps = {
  queryParams: any,
  kind: string,
  variables: any
};

export default compose(
  graphql<QueryProps>(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: ({ queryParams, kind, variables }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          ...variables,
          ...integrationsListParams(queryParams || {}),
          kind
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql<QueryProps>(gql(mutations.integrationsRemove), {
    name: 'removeMutation',
    options: ({ queryParams, kind }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.integrations),
            variables: {
              ...integrationsListParams(queryParams || {}),
              kind
            }
          },
          {
            query: gql(queries.integrationTotalCount)
          }
        ]
      };
    }
  })
)(IntegrationListContainer);
