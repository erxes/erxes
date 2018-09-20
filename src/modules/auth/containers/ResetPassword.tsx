import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { ResetPassword } from '../components';
import { mutations } from '../graphql';

interface IProps extends IRouterProps {
  token: string,
};

type MutationResponse = {
  resetPasswordMutation: (params: { variables: { newPassword: string, token: string } }) => any,
}

const ResetPasswordContainer = (props: IProps & MutationResponse) => {
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

export default withRouter<IProps>(
  compose(
    graphql(gql(mutations.resetPassword), {
      name: 'resetPasswordMutation'
    })
  )(ResetPasswordContainer)
);
