import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
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

    if (!currentPassword || currentPassword === 0) {
      return Alert.error('Please enter a current password');
    }

    if (!newPassword || newPassword === 0) {
      return Alert.error('Please enter a new password');
    }

    changePasswordMutation({ variables: { currentPassword, newPassword } })
      .then(() => {
        Alert.success('Your password has been changed and updated');
        props.closeModal();
      })
      .catch(error => {
        Alert.error(error.message);
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
