import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { UserDetails } from '../components';

const UserDetailsContainer = (props, context) => {
  const {
    userDetailQuery,
    usersEdit,
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
    currentUser: context.currentUser
  };

  return <UserDetails {...updatedProps} />;
};

UserDetailsContainer.propTypes = {
  id: PropTypes.string,
  userDetailQuery: PropTypes.object,
  usersEdit: PropTypes.func,
  channelsQuery: PropTypes.object,
  usersEditProfile: PropTypes.func,
  userActivityLogQuery: PropTypes.object,
  userConversationsQuery: PropTypes.object
};

UserDetailsContainer.contextTypes = {
  currentUser: PropTypes.object
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
    options: ({ id }) => ({
      variables: {
        _id: id
      }
    })
  }),
  graphql(gql(queries.userConversations), {
    name: 'userConversationsQuery',
    options: ({ id, queryParams }) => ({
      variables: {
        _id: id,
        perPage: queryParams.limit || 20
      }
    })
  }),
  graphql(gql(queries.channels), {
    name: 'channelsQuery',
    options: ({ id }) => ({
      variables: { memberIds: [id] }
    })
  }),
  graphql(gql(queries.userActivityLog), {
    name: 'userActivityLogQuery',
    options: ({ id }) => ({
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
