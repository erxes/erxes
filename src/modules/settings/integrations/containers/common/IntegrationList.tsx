import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import IntegrationList from 'modules/settings/integrations/components/common/IntegrationList';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  ArchiveMutationResponse,
  IntegrationsQueryResponse,
  RemoveMutationResponse
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
  ArchiveMutationResponse;

const IntegrationListContainer = (props: FinalProps) => {
  const { integrationsQuery, removeMutation, archiveIntegration } = props;

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

  const archive = (id: string, isArchived: boolean) => {
    archiveIntegration({ variables: { _id: id, isArchived } })
      .then(({ data }) => {
        const integration = data.integrationsArchive;

        if (integration && integration._id) {
          const action = integration.isArchived ? 'archived' : 'unarchived';

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
    archiveIntegration: archive
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
    graphql<Props, ArchiveMutationResponse>(
      gql(mutations.integrationsArchive),
      {
        name: 'archiveIntegration'
      }
    )
  )(IntegrationListContainer)
);
