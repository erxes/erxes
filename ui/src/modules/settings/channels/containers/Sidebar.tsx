import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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
  channelsCountQuery: ChannelsCountQueryResponse;
} & Props & IRouterProps &
  RemoveChannelMutationResponse;

const SidebarContainer = (props: FinalProps) => {
  const {
    channelsQuery,
    channelsCountQuery,
    removeMutation,
    queryParams,
    history,
    currentChannelId
  } = props;

  const channels = channelsQuery.channels || [];
  const channelsTotalCount = channelsCountQuery.channelsTotalCount || 0;

  // remove action
  const remove = channelId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: channelId }
      })
        .then(() => {
          Alert.success('You successfully deleted a channel.');

          history.push('/settings/channels');
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
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
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
    { query: gql(queries.channelsCount) }
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
  )(withRouter<FinalProps>(SidebarContainer))
);
