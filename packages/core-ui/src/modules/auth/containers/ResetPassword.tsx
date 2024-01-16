import * as compose from 'lodash.flowright';

import { Alert, withProps } from 'modules/common/utils';
import {
  ResetPasswordMutationResponse,
  ResetPasswordMutationVariables,
} from '../types';

// import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import ResetPassword from '../components/ResetPassword';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';

type Props = {
  token: string;
};

export type FinalProps = ResetPasswordMutationResponse & Props & IRouterProps;

const ResetPasswordContainer = (props: FinalProps) => {
  const { resetPasswordMutation, history, token } = props;

  const resetPassword = (newPassword) => {
    resetPasswordMutation({
      variables: {
        newPassword,
        token,
      },
    })
      .then(() => {
        history.push('/sign-in');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    resetPassword,
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
      name: 'resetPasswordMutation',
    }),
  )(ResetPasswordContainer),
);
