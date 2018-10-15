import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser, IUserDoc } from '../../../auth/types';
import { UserDetails } from '../components';
import { mutations, queries } from '../graphql';

type SaveUserProfileArgs = {
  usersEdit: (
    params: { variables: { _id: string; doc: IUserDoc } }
  ) => Promise<any>;
  usersEditProfile: (params: { variables: IUserDoc }) => Promise<any>;
};

type Props = {
  id?: string;
  userDetailQuery: any;
  channelsQuery: any;
  userActivityLogQuery: any;
  userConversationsQuery: any;
  currentUser: IUser;
};

const UserDetailsContainer = (props: Props & SaveUserProfileArgs) => {
  const {
    userDetailQuery,
    usersEdit,
    channelsQuery,
    usersEditProfile,
    userActivityLogQuery,
    userConversationsQuery,
    currentUser
  } = props;

  const user = userDetailQuery.userDetail || {};

  const saveUser = (
    _id: string,
    doc: IUserDoc,
    callback: (e: string) => void
  ) => {
    usersEdit({
      variables: { _id, doc }
    })
      .then(e => {
        Alert.success('Successfully saved');
        callback(e);
      })
      .catch(e => {
        callback(e);
      });
  };

  const saveProfile = (variables: IUserDoc) => {
    usersEditProfile({ variables })
      .then(() => {
        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const { list = [], totalCount = 0 } =
    userConversationsQuery.userConversations || {};

  const updatedProps = {
    ...props,
    saveUser,
    saveProfile,
    user: { ...user, participatedConversations: list },
    totalConversationCount: totalCount,
    loadingLogs: userActivityLogQuery.loading,
    activityLogsUser: userActivityLogQuery.activityLogsUser || [],
    channels: channelsQuery.channels || [],
    currentUser
  };

  return <UserDetails {...updatedProps} />;
};

const options = ({ id }) => ({
  refetchQueries: [
    { query: gql(queries.userDetail), variables: { _id: id } },
    { query: gql(queries.channels), variables: { memberIds: [id] } }
  ]
});

const WithQuery = compose(
  graphql(gql(queries.userDetail), {
    name: 'userDetailQuery',
    options: ({ id }: { id: string }) => ({
      variables: {
        _id: id
      }
    })
  }),
  graphql(gql(queries.userConversations), {
    name: 'userConversationsQuery',
    options: ({ id, queryParams }: { id: string; queryParams: any }) => ({
      variables: {
        _id: id,
        perPage: queryParams.limit || 20
      }
    })
  }),
  graphql(gql(queries.channels), {
    name: 'channelsQuery',
    options: ({ id }: { id: string }) => ({
      variables: { memberIds: [id] }
    })
  }),
  graphql(gql(queries.userActivityLog), {
    name: 'userActivityLogQuery',
    options: ({ id }: { id: string }) => ({
      variables: { _id: id }
    })
  }),
  graphql(gql(mutations.usersEditProfile), {
    name: 'usersEditProfile',
    options
  }),
  graphql(gql(mutations.usersEdit), {
    name: 'usersEdit',
    options
  })
)(UserDetailsContainer);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }) => <WithQuery {...props} currentUser={currentUser} />}
    </AppConsumer>
  );
};

export default WithConsumer;
