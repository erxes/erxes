import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import ResetPassword from '../components/ResetPassword';
import { mutations } from '../graphql';
import {
  ResetPasswordMutationResponse,
  ResetPasswordMutationVariables
} from '../types';

type Props = {
  token: string;
};

export type FinalProps = ResetPasswordMutationResponse & Props & IRouterProps;

const ResetPasswordContainer = (props: FinalProps) => {
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

export default withProps<Props>(
  compose(
    graphql<
      Props,
      ResetPasswordMutationResponse,
      ResetPasswordMutationVariables
    >(gql(mutations.resetPassword), {
      name: 'resetPasswordMutation'
    })
  )(withRouter<FinalProps>(ResetPasswordContainer))
);
