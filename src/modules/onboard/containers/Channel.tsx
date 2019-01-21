import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/channels/graphql';
import {
  AddChannelMutationResponse,
  ChannelMutationVariables,
  ChannelsCountQueryResponse,
  ChannelsQueryResponse,
  EditChannelMutationResponse,
  RemoveChannelMutationResponse,
  RemoveChannelMutationVariables
} from 'modules/settings/channels/types';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Channel } from '../components';
import { queries as onboardQueries } from '../graphql';
import { IntegrationsQueryResponse } from '../types';

type Props = {
  queryParams: any;
  currentChannelId?: string;
};

type FinalProps = {
  channelsQuery: ChannelsQueryResponse;
  usersQuery: UsersQueryResponse;
  channelsCountQuery: ChannelsCountQueryResponse;
  integrationsQuery: IntegrationsQueryResponse;
} & Props &
  AddChannelMutationResponse &
  EditChannelMutationResponse &
  RemoveChannelMutationResponse;

const SidebarContainer = (props: FinalProps) => {
  const {
    usersQuery,
    channelsQuery,
    channelsCountQuery,
    addMutation,
    integrationsQuery,
    removeMutation
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
          Alert.success('Successfully deleted.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create action
  const save = doc => {
    console.log(doc); //tslint:disable-line

    const { integrationIds, memberIds } = doc;

    if (memberIds.length === 0) {
      return Alert.error('Choose at least on user');
    }

    if (integrationIds.length === 0) {
      return Alert.error('Choose at least one messenger');
    }

    addMutation({ variables: doc })
      .then(() => {
        Alert.success('Successfully saved.');
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

const commonOptions = ({ queryParams }: Props) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.channels),
        variables: { perPage: queryParams.limit || 20 }
      },
      {
        query: gql(queries.channels),
        variables: {}
      },
      { query: gql(queries.channelsCount) },
      { query: gql(queries.users) }
    ]
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, ChannelsQueryResponse, { perPage: number }>(
      gql(queries.channels),
      {
        name: 'channelsQuery',
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: {
            perPage: queryParams.limit || 20
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
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
    graphql<
      Props,
      RemoveChannelMutationResponse,
      RemoveChannelMutationVariables
    >(gql(mutations.channelRemove), {
      name: 'removeMutation',
      options: commonOptions
    })
  )(SidebarContainer)
);
