import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';
import Form from 'modules/settings/integrations/components/messenger/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import {
  EditMessengerMutationResponse,
  EditMessengerMutationVariables,
  IMessengerData,
  IntegrationDetailQueryResponse,
  IUiOptions,
  SaveMessengerAppearanceMutationResponse,
  SaveMessengerConfigsMutationResponse
} from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router';
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
} & Props &
  SaveMessengerConfigsMutationResponse &
  SaveMessengerAppearanceMutationResponse &
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
    knowledgeBaseTopicsQuery
  } = props;

  if (
    integrationDetailQuery.loading ||
    usersQuery.loading ||
    brandsQuery.loading
  ) {
    return <Spinner />;
  }

  const users = usersQuery.users || [];
  const brands = brandsQuery.brands || [];
  const integration = integrationDetailQuery.integrationDetail || {};
  const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];

  const save = doc => {
    const { name, brandId, languageCode, messengerData, uiOptions } = doc;
    editMessengerMutation({
      variables: { _id: integrationId, name, brandId, languageCode }
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
        Alert.success('You successfully updated a messenger');

        history.push('/settings/integrations?refetch=true');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    teamMembers: users || [],
    brands,
    save,
    topics,
    integration
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
      SaveMessengerAppearanceMutationResponse,
      { _id: string; uiOptions: IUiOptions }
    >(gql(mutations.integrationsSaveMessengerAppearance), {
      name: 'saveAppearanceMutation',
      options: commonOptions
    })
  )(withRouter<FinalProps>(EditMessenger))
);
