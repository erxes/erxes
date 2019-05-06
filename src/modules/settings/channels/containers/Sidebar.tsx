import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { UsersQueryResponse } from '../../team/types';
import { Sidebar } from '../components';
import { mutations, queries } from '../graphql';
import {
  AddChannelMutationResponse,
  ChannelMutationVariables,
  ChannelsCountQueryResponse,
  ChannelsQueryResponse,
  EditChannelMutationResponse,
  EditChannelMutationVariables,
  RemoveChannelMutationResponse,
  RemoveChannelMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  currentChannelId?: string;
};

type FinalProps = {
  channelsQuery: ChannelsQueryResponse;
  usersQuery: UsersQueryResponse;
  channelsCountQuery: ChannelsCountQueryResponse;
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
    editMutation,
    removeMutation
  } = props;

  const channels = channelsQuery.channels || [];
  const members = usersQuery.users || [];
  const channelsTotalCount = channelsCountQuery.channelsTotalCount || 0;

  // remove action
  const remove = channelId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: channelId }
      })
        .then(() => {
          Alert.success('You successfully deleted a channel.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create or update action
  const save = ({ doc }, callback, channel) => {
    let mutation = addMutation;

    // if edit mode
    if (channel) {
      mutation = editMutation;
      doc._id = channel._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        Alert.success(
          `You successfully ${channel ? 'updated' : 'added'} a new channel.`
        );

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    members,
    channels,
    channelsTotalCount,
    save,
    remove,
    loading: channelsQuery.loading
  };

  return <Sidebar {...updatedProps} />;
};

const commonOptions = ({ queryParams, currentChannelId }: Props) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.channels),
        variables: {
          perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
        }
      },
      {
        query: gql(queries.channels),
        variables: {}
      },
      {
        query: gql(queries.integrationsCount),
        variables: {}
      },
      {
        query: gql(queries.channelDetail),
        variables: { _id: currentChannelId || '' }
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
            perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, UsersQueryResponse, {}>(gql(queries.users), {
      name: 'usersQuery',
      options: () => ({
        fetchPolicy: 'network-only',
        variables: {
          perPage: 100
        }
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
    graphql<Props, EditChannelMutationResponse, EditChannelMutationVariables>(
      gql(mutations.channelEdit),
      {
        name: 'editMutation',
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
