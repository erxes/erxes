import * as compose from 'lodash.flowright';

import { Alert, withProps } from 'modules/common/utils';
import {
  ResetPasswordMutationResponse,
  ResetPasswordMutationVariables,
} from '../types';

import React from 'react';
import ResetPassword from '../components/ResetPassword';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';
import { useNavigate } from 'react-router-dom';

type Props = {
  token: string;
};

export type FinalProps = ResetPasswordMutationResponse & Props;

const ResetPasswordContainer = (props: FinalProps) => {
  const { resetPasswordMutation, token } = props;
  const navigate = useNavigate();

  const resetPassword = (newPassword) => {
    resetPasswordMutation({
      variables: {
        newPassword,
        token,
      },
    })
      .then(() => {
        navigate('/sign-in');
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
