import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { IntegrationList } from 'modules/settings/integrations/components/common';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IntegrationsQueryResponse, RemoveMutationResponse } from '../../types';
import { integrationsListParams } from '../utils';

type Props = {
  queryParams: any;
  kind?: string | null;
  variables?: { brandId?: string; channelId?: string };
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
} & Props &
  RemoveMutationResponse;

const IntegrationListContainer = (props: FinalProps) => {
  const { integrationsQuery, removeMutation } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations || [];

  const removeIntegration = (integration, callback) => {
    confirm().then(() => {
      removeMutation({ variables: { _id: integration._id } })
        .then(() => {
          Alert.success('Your integration is no longer in this channel');
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

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
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
    graphql<Props, RemoveMutationResponse>(gql(mutations.integrationsRemove), {
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
  )(IntegrationListContainer)
);
