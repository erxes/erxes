import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, confirm } from 'modules/common/utils';
import { IntegrationList } from 'modules/settings/integrations/components/common';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { integrationsListParams } from '../utils';

type Props = {
  integrationsQuery: any;
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

const IntegrationListContainer = (props: Props) => {
  const { integrationsQuery, removeMutation } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective />;
  }

  const integrations = integrationsQuery.integrations || [];

  const removeIntegration = (integration, callback) => {
    confirm().then(() => {
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
    loading: integrationsQuery.loading,
    removeIntegration
  };

  return <IntegrationList {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: ({
      queryParams,
      kind,
      variables
    }: {
      queryParams: any;
      kind: string;
      variables: any;
    }) => {
      return {
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        variables: {
          ...variables,
          ...integrationsListParams(queryParams || {}),
          kind
        }
      };
    }
  }),
  graphql(gql(mutations.integrationsRemove), {
    name: 'removeMutation',
    options: ({ queryParams, kind }: { queryParams: any; kind: string }) => {
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
