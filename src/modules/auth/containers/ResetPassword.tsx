import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { ResetPassword } from '../components';
import { mutations } from '../graphql';

type Props = {
  token?: string,
  resetPasswordMutation?: (params: { variables: { newPassword: string, token: string } }) => any,
  history: any,
  location: any,
  match: any
};

const ResetPasswordContainer = (props: Props) => {
  const { resetPasswordMutation, history, token } = props;

  const resetPassword = newPassword => {
    resetPasswordMutation({
      variables: {
        newPassword,
        token
      }
    })
      .then(() => {
        history.push('/sign-in');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    resetPassword
  };

  return <ResetPassword {...updatedProps} />;
};

export default withRouter<Props>(
  compose(
    graphql(gql(mutations.resetPassword), {
      name: 'resetPasswordMutation'
    })
  )(ResetPasswordContainer)
);
