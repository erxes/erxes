import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { queries, mutations } from '../graphql';
import { UserDetails } from '../components';

const UserDetailsContainer = (props, context) => {
  const { userDetailQuery, usersEdit, channelsQuery, usersEditProfile } = props;

  if (userDetailQuery.loading || channelsQuery.loading) {
    return (
      <Sidebar full>
        <Spinner />
      </Sidebar>
    );
  }

  const user = userDetailQuery.userDetail;

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

  const updatedProps = {
    ...props,
    saveUser,
    saveProfile,
    user,
    channels: channelsQuery.channels,
    currentUser: context.currentUser
  };

  return <UserDetails {...updatedProps} />;
};

UserDetailsContainer.propTypes = {
  id: PropTypes.string,
  userDetailQuery: PropTypes.object,
  usersEdit: PropTypes.func,
  channelsQuery: PropTypes.object,
  usersEditProfile: PropTypes.func
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
  graphql(gql(queries.channels), {
    name: 'channelsQuery',
    options: ({ id }) => ({
      variables: { memberIds: [id] }
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
