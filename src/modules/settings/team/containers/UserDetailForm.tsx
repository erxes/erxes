import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { UserDetailForm } from '../components';
import { queries } from '../graphql';
import {
  ActivityLogQueryResponse,
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
  channelsQuery: any;
  userActivityLogQuery: ActivityLogQueryResponse;
  userConversationsQuery: UserConverationsQueryResponse;
  renderEditForm: (
    { closeModal, user }: { closeModal: () => void; user: IUser }
  ) => React.ReactNode;
};

const UserDetailFormContainer = (props: FinalProps) => {
  const {
    userDetailQuery,
    channelsQuery,
    userActivityLogQuery,
    userConversationsQuery,
    renderEditForm
  } = props;

  const { list = [], totalCount = 0 } =
    userConversationsQuery.userConversations || {};

  const updatedProps = {
    renderEditForm,
    user: userDetailQuery.userDetail || {},
    participatedConversations: list,
    totalConversationCount: totalCount,
    loadingLogs: userActivityLogQuery.loading,
    activityLogsUser: userActivityLogQuery.activityLogsUser || [],
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
          perPage: queryParams.limit || 20
        }
      })
    }),
    graphql(gql(queries.channels), {
      name: 'channelsQuery',
      options: commonOptions
    }),
    graphql<Props, ActivityLogQueryResponse, { _id: string }>(
      gql(queries.userActivityLog),
      {
        name: 'userActivityLogQuery',
        options: commonOptions
      }
    )
  )(UserDetailFormContainer)
);
