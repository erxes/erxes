import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { ChangePassword } from '../components';

const ChangePasswordContainer = props => {
  const { changePasswordMutation } = props;

  const save = ({ currentPassword, newPassword, confirmation }) => {
    if (newPassword !== confirmation) {
      return Alert.error("Password didn't match");
    }

    changePasswordMutation({ variables: { currentPassword, newPassword } })
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

  return <ChangePassword {...updatedProps} />;
};

ChangePasswordContainer.propTypes = {
  changePasswordMutation: PropTypes.func
};

export default compose(
  graphql(
    gql`
      mutation usersChangePassword(
        $currentPassword: String!
        $newPassword: String!
      ) {
        usersChangePassword(
          currentPassword: $currentPassword
          newPassword: $newPassword
        ) {
          _id
        }
      }
    `,
    {
      name: 'changePasswordMutation'
    }
  )
)(ChangePasswordContainer);
