import gql from 'graphql-tag';
import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { UsersQueryResponse } from '../../team/types';
import { Sidebar } from '../components';
import { mutations, queries } from '../graphql';
import {
  ChannelsCountQueryResponse,
  ChannelsQueryResponse,
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
  RemoveChannelMutationResponse;

const SidebarContainer = (props: FinalProps) => {
  const {
    usersQuery,
    channelsQuery,
    channelsCountQuery,
    removeMutation,
    queryParams,
    currentChannelId
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

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.channelEdit : mutations.channelAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(queryParams, currentChannelId)}
        isSubmitted={isSubmitted}
        type="submit"
        icon="send"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    members,
    channels,
    channelsTotalCount,
    remove,
    renderButton,
    loading: channelsQuery.loading
  };

  return <Sidebar {...updatedProps} />;
};

const getRefetchQueries = (queryParams, currentChannelId?: string) => {
  return [
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
  ];
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
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, ChannelsCountQueryResponse, {}>(gql(queries.channelsCount), {
      name: 'channelsCountQuery'
    }),
    graphql<
      Props,
      RemoveChannelMutationResponse,
      RemoveChannelMutationVariables
    >(gql(mutations.channelRemove), {
      name: 'removeMutation',
      options: ({ queryParams, currentChannelId }: Props) => ({
        refetchQueries: getRefetchQueries(queryParams, currentChannelId)
      })
    })
  )(SidebarContainer)
);
