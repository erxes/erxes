import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import ChangePassword from '../components/ChangePassword';
import { ChangePasswordMutationResponse } from '../types';

type Props = {
  closeModal: () => void;
};

const ChangePasswordContainer = (
  props: Props & ChangePasswordMutationResponse
) => {
  const { changePasswordMutation } = props;

  const save = ({ currentPassword, newPassword, confirmation }) => {
    if (newPassword !== confirmation) {
      return Alert.error("Password didn't match");
    }

    changePasswordMutation({ variables: { currentPassword, newPassword } })
      .then(() => {
        Alert.success('Your password has been changed and updated');
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

export default withProps<Props>(
  compose(
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
  )(ChangePasswordContainer)
);
