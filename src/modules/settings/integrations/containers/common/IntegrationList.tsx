import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import IntegrationList from 'modules/settings/integrations/components/common/IntegrationList';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  IntegrationsQueryResponse,
  RemoveMutationResponse,
  ToggleMutationResponse
} from '../../types';
import { integrationsListParams } from '../utils';

type Props = {
  queryParams: any;
  kind?: string | null;
  variables?: { brandId?: string; channelId?: string };
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
} & Props &
  RemoveMutationResponse &
  ToggleMutationResponse;

const IntegrationListContainer = (props: FinalProps) => {
  const { integrationsQuery, removeMutation, toggleStatus } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations || [];

  const removeIntegration = integration => {
    confirm().then(() => {
      Alert.warning('Removing... Please wait!!!');

      removeMutation({ variables: { _id: integration._id } })
        .then(() => {
          Alert.success('Your integration is no longer in this channel');
        })

        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const toggleIntegration = (id: string, isActive: boolean) => {
    toggleStatus({ variables: { _id: id, isActive } })
      .then(({ data }) => {
        const integration = data.integrationsToggleStatus;

        if (integration && integration._id) {
          const action = integration.isActive ? 'activated' : 'deactivated';

          Alert.success(`Integration has been ${action}`);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    integrations,
    removeIntegration,
    loading: integrationsQuery.loading,
    toggleIntegration
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
      options: ({ queryParams, variables, kind }) => {
        return {
          refetchQueries: [
            {
              query: gql(queries.integrations),
              variables: {
                ...variables,
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
    }),
    graphql<Props, ToggleMutationResponse>(
      gql(mutations.integrationsToggleStatus),
      {
        name: 'toggleStatus'
      }
    )
  )(IntegrationListContainer)
);
