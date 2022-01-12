import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { __, Alert, withProps } from 'modules/common/utils';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';
import Form from 'modules/settings/integrations/components/messenger/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import {
  EditMessengerMutationResponse,
  EditMessengerMutationVariables,
  IMessengerApps,
  IMessengerData,
  IntegrationDetailQueryResponse,
  IUiOptions,
  MessengerAppsQueryResponse,
  SaveMessengerAppearanceMutationResponse,
  SaveMessengerAppsMutationResponse,
  SaveMessengerConfigsMutationResponse
} from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { TopicsQueryResponse } from '../../../../knowledgeBase/types';
import { BrandsQueryResponse } from '../../../brands/types';
import { UsersQueryResponse } from '../../../team/types';

type Props = {
  integrationId: string;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  brandsQuery: BrandsQueryResponse;
  integrationDetailQuery: IntegrationDetailQueryResponse;
  knowledgeBaseTopicsQuery: TopicsQueryResponse;
  messengerAppsQuery: MessengerAppsQueryResponse;
} & Props &
  SaveMessengerConfigsMutationResponse &
  SaveMessengerAppearanceMutationResponse &
  SaveMessengerAppsMutationResponse &
  EditMessengerMutationResponse &
  IRouterProps;

const EditMessenger = (props: FinalProps) => {
  const {
    history,
    integrationId,
    usersQuery,
    brandsQuery,
    integrationDetailQuery,
    editMessengerMutation,
    saveConfigsMutation,
    saveAppearanceMutation,
    messengerAppSaveMutation,
    knowledgeBaseTopicsQuery,
    messengerAppsQuery
  } = props;

  if (
    integrationDetailQuery.loading ||
    usersQuery.loading ||
    brandsQuery.loading ||
    messengerAppsQuery.loading
  ) {
    return <Spinner />;
  }

  const users = usersQuery.users || [];
  const brands = brandsQuery.brands || [];
  const integration = integrationDetailQuery.integrationDetail || {};
  const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];
  const apps = messengerAppsQuery.messengerApps || {};

  const deleteTypeName = datas => {
    return (datas || []).filter(item => delete item.__typename);
  };

  const save = doc => {
    const {
      name,
      brandId,
      channelIds,
      languageCode,
      messengerData,
      uiOptions,
      messengerApps
    } = doc;

    editMessengerMutation({
      variables: {
        _id: integrationId,
        name,
        brandId,
        languageCode,
        channelIds
      }
    })
      .then(({ data }) => {
        const id = data.integrationsEditMessengerIntegration._id;

        return saveConfigsMutation({
          variables: { _id: id, messengerData }
        });
      })
      .then(({ data }) => {
        const id = data.integrationsSaveMessengerConfigs._id;

        return saveAppearanceMutation({
          variables: { _id: id, uiOptions }
        });
      })
      .then(() => {
        const messengerAppsWithoutTypename = {
          websites: deleteTypeName(messengerApps.websites),
          knowledgebases: deleteTypeName(messengerApps.knowledgebases),
          leads: deleteTypeName(messengerApps.leads)
        };

        return messengerAppSaveMutation({
          variables: {
            integrationId,
            messengerApps: messengerAppsWithoutTypename
          }
        });
      })
      .then(() => {
        Alert.success('You successfully updated a messenger');

        history.push('/settings/integrations?refetch=true');
      })
      .catch(error => {
        if (error.message.includes('Duplicated messenger for single brand')) {
          return Alert.warning(
            __(
              "You've already created a messenger for the brand you've selected. Please choose a different brand or edit the previously created messenger"
            ),
            6000
          );
        }

        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    teamMembers: users || [],
    brands,
    save,
    topics,
    integration,
    messengerApps: apps
  };

  return <Form {...updatedProps} />;
};

const commonOptions = ({ integrationId }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.integrationDetail),
        variables: { _id: integrationId || '' },
        fetchPolicy: 'network-only'
      }
    ]
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, UsersQueryResponse>(gql(queries.users), {
      name: 'usersQuery'
    }),
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, TopicsQueryResponse>(gql(kbQueries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopicsQuery'
    }),
    graphql<Props, MessengerAppsQueryResponse, { integrationId: string }>(
      gql(queries.messengerApps),
      {
        name: 'messengerAppsQuery',
        options: ({ integrationId }: { integrationId: string }) => ({
          variables: {
            integrationId
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, IntegrationDetailQueryResponse, { _id: string }>(
      gql(queries.integrationDetail),
      {
        name: 'integrationDetailQuery',
        options: ({ integrationId }: { integrationId: string }) => ({
          variables: {
            _id: integrationId || ''
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<
      Props,
      EditMessengerMutationResponse,
      EditMessengerMutationVariables
    >(gql(mutations.integrationsEditMessenger), {
      name: 'editMessengerMutation',
      options: commonOptions
    }),
    graphql<
      Props,
      SaveMessengerConfigsMutationResponse,
      { _id: string; messengerData: IMessengerData }
    >(gql(mutations.integrationsSaveMessengerConfigs), {
      name: 'saveConfigsMutation',
      options: commonOptions
    }),
    graphql<
      Props,
      SaveMessengerAppsMutationResponse,
      { _id: string; messengerApps: IMessengerApps }
    >(gql(mutations.messengerAppSave), {
      name: 'messengerAppSaveMutation',
      options: commonOptions
    }),
    graphql<
      Props,
      SaveMessengerAppearanceMutationResponse,
      { _id: string; uiOptions: IUiOptions }
    >(gql(mutations.integrationsSaveMessengerAppearance), {
      name: 'saveAppearanceMutation',
      options: commonOptions
    })
  )(withRouter<FinalProps>(EditMessenger))
);
