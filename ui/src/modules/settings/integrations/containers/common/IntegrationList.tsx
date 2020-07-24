import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import IntegrationList from 'modules/settings/integrations/components/common/IntegrationList';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  ArchiveIntegrationResponse,
  CommonFieldsEditResponse,
  IntegrationMutationVariables,
  IntegrationsQueryResponse,
  RemoveMutationResponse
} from '../../types';
import { integrationsListParams } from '../utils';

type Props = {
  queryParams: any;
  kind?: string | null;
  variables?: { brandId?: string; channelId?: string };
  disableAction?: boolean;
  integrationsCount: number;
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
} & Props &
  RemoveMutationResponse &
  ArchiveIntegrationResponse &
  CommonFieldsEditResponse;

const IntegrationListContainer = (props: FinalProps) => {
  const {
    integrationsQuery,
    removeMutation,
    archiveIntegration,
    editCommonFields
  } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations || [];

  const removeIntegration = integration => {
    const message =
      'If you remove an integration, then all related conversations, customers & pop ups will also be removed. Are you sure?';

    confirm(message).then(() => {
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

  const archive = (id: string, status: boolean) => {
    let message =
      "If you archive an integration, then you won't be able to see customers & conversations related to this integration anymore. Are you sure?";
    let action = 'archived';

    if (!status) {
      message = 'You are going to unarchive this integration. Are you sure?';
      action = 'unarchived';
    }

    confirm(message).then(() => {
      archiveIntegration({ variables: { _id: id, status } })
        .then(({ data }) => {
          const integration = data.integrationsArchive;

          if (integration && integration._id) {
            Alert.success(`Integration has been ${action}.`);
          }
        })
        .catch((error: Error) => {
          Alert.error(error.message);
        });
    });
  };

  const editIntegration = (
    id: string,
    { name, brandId, channelIds }: IntegrationMutationVariables
  ) => {
    if (!name && !brandId) {
      Alert.error('Name and brand must be chosen');

      return;
    }

    editCommonFields({ variables: { _id: id, name, brandId, channelIds } })
      .then(({ data }) => {
        const result = data.integrationsEditCommonFields;

        if (result && result._id) {
          Alert.success('Integration has been edited.');
        }
      })
      .catch((error: Error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    integrations,
    removeIntegration,
    loading: integrationsQuery.loading,
    archive,
    editIntegration
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
    ),
    graphql<Props, CommonFieldsEditResponse>(
      gql(mutations.integrationsEditCommonFields),
      {
        name: 'editCommonFields',
        options: mutationOptions
      }
    )
  )(IntegrationListContainer)
);
