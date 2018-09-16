import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { UserDetails } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  id: string,
  userDetailQuery: any,
  usersEdit: (params: { variables: any }) => any,
  channelsQuery: any,
  usersEditProfile: (params: { variables: any }) => any,
  userActivityLogQuery: any,
  userConversationsQuery: any,
  currentUser: any
};

const UserDetailsContainer = (props: Props) => {
  const {
    userDetailQuery,
    usersEdit,
    currentUser,
    channelsQuery,
    usersEditProfile,
    userActivityLogQuery,
    userConversationsQuery
  } = props;

  const user = userDetailQuery.userDetail || {};

  const saveUser = ({ doc }, callback) => {
    doc._id = user._id;

    usersEdit({
      variables: doc
    })
      .then(() => {
        Alert.success('Successfully saved');
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const saveProfile = variables => {
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

export default compose(
  graphql(gql(queries.userDetail), {
    name: 'userDetailQuery',
    options: ({ id } : { id: string }) => ({
      variables: {
        _id: id
      }
    })
  }),
  graphql(gql(queries.userConversations), {
    name: 'userConversationsQuery',
    options: ({ id, queryParams } : { id: string, queryParams: any }) => ({
      variables: {
        _id: id,
        perPage: queryParams.limit || 20
      }
    })
  }),
  graphql(gql(queries.channels), {
    name: 'channelsQuery',
    options: ({ id } : { id: string }) => ({
      variables: { memberIds: [id] }
    })
  }),
  graphql(gql(queries.userActivityLog), {
    name: 'userActivityLogQuery',
    options: ({ id } : { id: string }) => ({
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
