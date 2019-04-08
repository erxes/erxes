import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, confirm } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/channels/graphql';
import {
  AddChannelMutationResponse,
  ChannelMutationVariables,
  ChannelsCountQueryResponse,
  ChannelsQueryResponse,
  RemoveChannelMutationResponse,
  RemoveChannelMutationVariables
} from 'modules/settings/channels/types';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Channel } from '../components';
import { OnboardConsumer } from '../containers/OnboardContext';
import {
  mutations as onBoardMutations,
  queries as onboardQueries
} from '../graphql';
import {
  IntegrationsQueryResponse,
  UserSeenOnboardMutationResponse
} from '../types';

type Props = { changeStep: () => void };

type FinalProps = {
  channelsQuery: ChannelsQueryResponse;
  usersQuery: UsersQueryResponse;
  channelsCountQuery: ChannelsCountQueryResponse;
  integrationsQuery: IntegrationsQueryResponse;
} & Props &
  IRouterProps &
  AddChannelMutationResponse &
  RemoveChannelMutationResponse &
  UserSeenOnboardMutationResponse;

const SidebarContainer = (props: FinalProps) => {
  const {
    usersQuery,
    channelsQuery,
    channelsCountQuery,
    addMutation,
    integrationsQuery,
    removeMutation,
    userSeenOnboardMutation,
    history
  } = props;

  const channels = channelsQuery.channels || [];
  const members = usersQuery.users || [];
  const channelsTotalCount = channelsCountQuery.channelsTotalCount || 0;
  const integrations = integrationsQuery.integrations || [];

  // remove action
  const remove = channelId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: channelId }
      })
        .then(() => {
          Alert.success('You successfully deleted a category');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create action
  const save = doc => {
    const { integrationIds, memberIds } = doc;

    if (memberIds.length === 0) {
      return Alert.error('Choose at least on user');
    }

    if (integrationIds.length === 0) {
      return Alert.error('Choose at least one messenger');
    }

    addMutation({ variables: doc })
      .then(() => {
        return userSeenOnboardMutation();
      })
      .then(() => {
        Alert.success('You successfully added a channel');

        setTimeout(() => {
          history.push('/');
        }, 800);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    members,
    channels,
    integrations,
    channelsTotalCount,
    save,
    remove,
    loading: channelsQuery.loading
  };

  return <Channel {...updatedProps} />;
};

const commonOptions = () => {
  return {
    refetchQueries: [
      {
        query: gql(queries.channels),
        variables: {}
      },
      { query: gql(queries.channelsCount) },
      { query: gql(queries.users) }
    ]
  };
};

const WithQuery = compose(
  graphql<Props, ChannelsQueryResponse>(gql(queries.channels), {
    name: 'channelsQuery',
    options: () => ({
      variables: {},
      fetchPolicy: 'network-only'
    })
  }),
  graphql<{}, IntegrationsQueryResponse>(gql(onboardQueries.integrations), {
    name: 'integrationsQuery',
    options: () => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          kind: 'messenger'
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql<Props, UsersQueryResponse, {}>(gql(queries.users), {
    name: 'usersQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql<Props, ChannelsCountQueryResponse, {}>(gql(queries.channelsCount), {
    name: 'channelsCountQuery'
  }),
  graphql<Props, AddChannelMutationResponse, ChannelMutationVariables>(
    gql(mutations.channelAdd),
    {
      name: 'addMutation',
      options: commonOptions
    }
  ),
  graphql<UserSeenOnboardMutationResponse>(
    gql(onBoardMutations.userSeenOnboard),
    { name: 'userSeenOnboardMutation' }
  ),
  graphql<Props, RemoveChannelMutationResponse, RemoveChannelMutationVariables>(
    gql(mutations.channelRemove),
    {
      name: 'removeMutation',
      options: commonOptions
    }
  )
)(withRouter<FinalProps>(SidebarContainer));

export default () => (
  <OnboardConsumer>
    {({ changeStep }) => <WithQuery changeStep={changeStep} />}
  </OnboardConsumer>
);
