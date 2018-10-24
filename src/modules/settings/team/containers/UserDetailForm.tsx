import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { UserDetailForm } from '../components';
import { queries } from '../graphql';
import { UserDetailQueryResponse } from '../types';

type Props = {
  userDetailQuery: UserDetailQueryResponse;
  channelsQuery: any;
  userActivityLogQuery: any;
  userConversationsQuery: any;
  renderEditForm: (
    { closeModal, user }: { closeModal: () => void; user: IUser }
  ) => React.ReactNode;
};

const UserDetailFormContainer = (props: Props) => {
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

export default compose(
  graphql(gql(queries.userDetail), {
    name: 'userDetailQuery',
    options: ({ _id }: { _id: string }) => ({
      variables: { _id }
    })
  }),
  graphql(gql(queries.userConversations), {
    name: 'userConversationsQuery',
    options: ({ _id, queryParams }: { _id: string; queryParams: any }) => ({
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
  graphql(gql(queries.userActivityLog), {
    name: 'userActivityLogQuery',
    options: commonOptions
  })
)(UserDetailFormContainer);
