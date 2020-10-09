import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import Form from 'modules/settings/integrations/components/messenger/Form';
import { integrationsListParams } from 'modules/settings/integrations/containers/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';

import * as compose from 'lodash.flowright';
import {
  IMessengerApps,
  IMessengerData,
  IUiOptions,
  SaveMessengerAppearanceMutationResponse,
  SaveMessengerAppsMutationResponse,
  SaveMessengerConfigsMutationResponse,
  SaveMessengerMutationResponse,
  SaveMessengerMutationVariables
} from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { TopicsQueryResponse } from '../../../../knowledgeBase/types';
import { BrandsQueryResponse } from '../../../brands/types';
import { UsersQueryResponse } from '../../../team/types';

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
          history.push(
            `/settings/integrations?refetch=true&_id=${id}&kind=messenger`
          );
        }
      )
      .catch(error => {
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
