import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import UserResetPasswordForm from '../components/UserResetPasswordForm';
import { ResetMemberPasswordResponse } from '../types';
import { IUser } from 'modules/auth/types';
import { mutations } from '../graphql';

type Props = {
  object: IUser;
  closeModal: () => void;
};

const UserResetPasswordContainer = (
  props: Props & ResetMemberPasswordResponse
) => {
  const { resetMemberPassword } = props;

  const save = ({ _id, newPassword }) => {
    if (!newPassword || newPassword === 0) {
      return Alert.error('Please enter a new password');
    }

    resetMemberPassword({ variables: { _id, newPassword } })
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

  return <UserResetPasswordForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(mutations.resetMemberPassword), {
      name: 'resetMemberPassword',
      options: {
        refetchQueries: ['users']
      }
    })
  )(UserResetPasswordContainer)
);
