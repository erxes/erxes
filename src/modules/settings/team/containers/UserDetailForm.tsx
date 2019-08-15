import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries as channelQueries } from '../../channels/graphql';
import { ChannelsQueryResponse } from '../../channels/types';
import UserDetailForm from '../components/detail/UserDetailForm';
import { queries } from '../graphql';
import {
  UserConverationsQueryResponse,
  UserDetailQueryResponse
} from '../types';

type Props = {
  _id: string;
  queryParams: any;
  renderEditForm: React.ReactNode;
};

type FinalProps = {
  userDetailQuery: UserDetailQueryResponse;
  channelsQuery: ChannelsQueryResponse;
  userConversationsQuery: UserConverationsQueryResponse;
  renderEditForm: (
    { closeModal, user }: { closeModal: () => void; user: IUser }
  ) => React.ReactNode;
};

const UserDetailFormContainer = (props: FinalProps) => {
  const {
    userDetailQuery,
    channelsQuery,
    userConversationsQuery,
    renderEditForm
  } = props;

  if (userDetailQuery.loading) {
    return <Spinner />;
  }

  const { list = [], totalCount = 0 } =
    userConversationsQuery.userConversations || {};

  const updatedProps = {
    renderEditForm,
    user: userDetailQuery.userDetail || {},
    participatedConversations: list,
    totalConversationCount: totalCount,
    channels: channelsQuery.channels || []
  };

  return <UserDetailForm {...updatedProps} />;
};

const commonOptions = ({ _id }: { _id: string }) => ({
  variables: { _id }
});

export default withProps<Props>(
  compose(
    graphql<Props, UserDetailQueryResponse, { _id: string }>(
      gql(queries.userDetail),
      {
        name: 'userDetailQuery',
        options: ({ _id }) => ({
          variables: { _id }
        })
      }
    ),
    graphql<
      Props,
      UserConverationsQueryResponse,
      { _id: string; perPage: number }
    >(gql(queries.userConversations), {
      name: 'userConversationsQuery',
      options: ({ _id, queryParams }) => ({
        variables: {
          _id,
          perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
        }
      })
    }),
    graphql(gql(channelQueries.channels), {
      name: 'channelsQuery',
      options: commonOptions
    })
  )(UserDetailFormContainer)
);
