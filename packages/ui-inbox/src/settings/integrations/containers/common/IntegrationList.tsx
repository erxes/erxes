import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  ArchiveIntegrationResponse,
  IntegrationMutationVariables,
  IntegrationsQueryResponse
} from '../../types';
import {
  CommonFieldsEditResponse,
  RemoveMutationResponse,
  RepairMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import IntegrationList from '../../components/common/IntegrationList';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
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
  CommonFieldsEditResponse &
  RepairMutationResponse;

const IntegrationListContainer = (props: FinalProps) => {
  const {
    integrationsQuery,
    removeMutation,
    archiveIntegration,
    repairIntegration,
    editCommonFields
  } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations || [];

  const removeIntegration = integration => {
    const message =
      'If you remove an integration, then all related conversations, customers & forms will also be removed. Are you sure?';

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

  const repair = (id: string, kind: string) => {
    repairIntegration({ variables: { _id: id, kind } })
      .then(() => {
        Alert.success(`Success`);
      })
      .catch((error: Error) => {
        Alert.error(error.message);
      });
  };

  const editIntegration = (
    id: string,
    { name, brandId, channelIds, data }: IntegrationMutationVariables
  ) => {
    if (!name && !brandId) {
      Alert.error('Name and brand must be chosen');

      return;
    }

    editCommonFields({
      variables: { _id: id, name, brandId, channelIds, data }
    })
      .then(response => {
        const result = response.data.integrationsEditCommonFields;

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
    repair,
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
    graphql<Props, RepairMutationResponse>(gql(mutations.integrationsRepair), {
      name: 'repairIntegration',
      options: mutationOptions
    }),
    graphql<Props, CommonFieldsEditResponse>(
      gql(mutations.integrationsEditCommonFields),
      {
        name: 'editCommonFields',
        options: mutationOptions
      }
    )
  )(IntegrationListContainer)
);
