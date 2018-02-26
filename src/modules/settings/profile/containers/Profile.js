import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Profile } from '../components';

const ProfileContainer = (props, { currentUser }) => {
  const { editProfileMutation } = props;

  const save = variables => {
    editProfileMutation({ variables })
      .then(() => {
        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    currentUser,
    save
  };

  return <Profile {...updatedProps} />;
};

ProfileContainer.propTypes = {
  editProfileMutation: PropTypes.func
};

ProfileContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default compose(
  graphql(
    gql`
      mutation usersEditProfile(
        $username: String!
        $email: String!
        $details: UserDetails
        $links: UserLinks
        $password: String!
      ) {
        usersEditProfile(
          username: $username
          email: $email
          details: $details
          links: $links
          password: $password
        ) {
          _id
        }
      }
    `,
    {
      name: 'editProfileMutation'
    }
  )
)(ProfileContainer);
