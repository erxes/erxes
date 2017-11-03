import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { withCurrentUser } from 'modules/auth/containers';
import { Alert } from 'modules/common/utils';
import { Profile } from '../components';

const ProfileContainer = props => {
  const { editProfileMutation } = props;

  const save = variables => {
    editProfileMutation({ variables })
      .then(() => {
        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.success(error.message);
      });
  };

  const updatedProps = {
    ...props,
    save
  };

  return <Profile {...updatedProps} />;
};

ProfileContainer.propTypes = {
  editProfileMutation: PropTypes.func
};

export default withCurrentUser(
  compose(
    graphql(
      gql`
        mutation usersEditProfile(
          $username: String!
          $email: String!
          $details: UserDetails
          $password: String!
        ) {
          usersEditProfile(
            username: $username
            email: $email
            details: $details
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
  )(ProfileContainer)
);
