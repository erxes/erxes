import gql from 'graphql-tag';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import { queries as kbQueries } from '@erxes/ui-knowledgebase/src/graphql';
import { __, Alert, withProps } from 'coreui/utils';
import { queries as brandQueries } from '@erxes/ui/src/brands/graphql';
import Form from '../../components/messenger/Form';
import { integrationsListParams } from '@erxes/ui-inbox/src/settings/integrations/containers/utils';
import {
  mutations,
  queries
} from '@erxes/ui-settings/src/integrations/graphql';

import * as compose from 'lodash.flowright';
import {
  IMessengerApps,
  SaveMessengerAppearanceMutationResponse,
  SaveMessengerAppsMutationResponse,
  SaveMessengerConfigsMutationResponse,
  SaveMessengerMutationResponse,
  SaveMessengerMutationVariables
} from '@erxes/ui-inbox/src/settings/integrations/types';
import {
  IMessengerData,
  IUiOptions
} from '@erxes/ui-settings/src/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { TopicsQueryResponse } from '@erxes/ui-knowledgebase/src/types';

type Props = {
  queryParams: any;
  integrationId?: string;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  brandsQuery: BrandsQueryResponse;
  knowledgeBaseTopicsQuery: TopicsQueryResponse;
} & Props &
  IRouterProps &
  SaveMessengerMutationResponse &
  SaveMessengerConfigsMutationResponse &
  SaveMessengerAppsMutationResponse &
  SaveMessengerAppearanceMutationResponse;

const CreateMessenger = (props: FinalProps) => {
  const {
    history,
    usersQuery,
    brandsQuery,
    saveMessengerMutation,
    saveConfigsMutation,
    saveAppearanceMutation,
    messengerAppSaveMutation,
    knowledgeBaseTopicsQuery
  } = props;

  if (usersQuery.loading || brandsQuery.loading) {
    return <Spinner />;
  }

  const users = usersQuery.users || [];
  const brands = brandsQuery.brands || [];
  const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];

  const save = doc => {
    const {
      name,
      brandId,
      languageCode,
      messengerData,
      uiOptions,
      channelIds,
      messengerApps
    } = doc;

    let id = '';
    saveMessengerMutation({
      variables: { name, brandId, languageCode, channelIds }
    })
      .then(({ data }) => {
        const integrationId = data.integrationsCreateMessengerIntegration._id;
        id = integrationId;
        return saveConfigsMutation({
          variables: { _id: integrationId, messengerData }
        });
      })
      .then(({ data }) => {
        const integrationId = data.integrationsSaveMessengerConfigs._id;

        return saveAppearanceMutation({
          variables: { _id: integrationId, uiOptions }
        });
      })
      .then(({ data }) => {
        const integrationId = data.integrationsSaveMessengerAppearanceData._id;

        return messengerAppSaveMutation({
          variables: { integrationId, messengerApps }
        });
      })
      .then(() => {
        Alert.success('You successfully added an integration');
        history.push(`/settings/add-ons?refetch=true&_id=${id}&kind=messenger`);
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
    topics
  };

  return <Form {...updatedProps} />;
};

const commonOptions = ({ integrationId }: { integrationId?: string }) => {
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
    graphql<Props, BrandsQueryResponse>(gql(brandQueries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, TopicsQueryResponse>(gql(kbQueries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopicsQuery'
    }),
    graphql<
      Props,
      SaveMessengerMutationResponse,
      SaveMessengerMutationVariables
    >(gql(mutations.integrationsCreateMessenger), {
      name: 'saveMessengerMutation',
      options: ({ queryParams }) => {
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
  )(withRouter<FinalProps>(CreateMessenger))
);
