import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import IntegrationList from 'modules/settings/integrations/components/common/IntegrationList';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  ArchiveIntegrationResponse,
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
  ArchiveIntegrationResponse;

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

  const archive = (id: string) => {
    const message = `
      If you archive an integration, then you won't be able to see customers & conversations 
      related to this integration anymore.
      Are you sure?
    `;

    confirm(message).then(() => {
      archiveIntegration({ variables: { _id: id } })
        .then(({ data }) => {
          const integration = data.integrationsArchive;

          if (integration && integration._id) {
            Alert.success('Integration has been archived.');
          }
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    integrations,
    removeIntegration,
    loading: integrationsQuery.loading,
    archive
  };

  return <IntegrationList {...updatedProps} />;
};

const mutationOptions = ({
  queryParams,
  variables,
  kind
}: {
  queryParams?: any;
  variables?: any;
  kind?: any;
}) => ({
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
});

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
      options: mutationOptions
    }),
    graphql<Props, ArchiveIntegrationResponse>(
      gql(mutations.integrationsArchive),
      {
        name: 'archiveIntegration',
        options: mutationOptions
      }
    )
  )(IntegrationListContainer)
);
