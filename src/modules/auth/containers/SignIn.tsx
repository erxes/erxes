import apolloClient from 'apolloClient';
import consts from 'consts';
import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { SignIn } from '../components';
import { mutations } from '../graphql';
import { LoginMutationResponse } from '../types';

type FinalProps = IRouterProps & LoginMutationResponse;

const SignInContainer = (props: FinalProps) => {
  const { loginMutation, history } = props;

  const login = variables => {
    const { LOGIN_TOKEN_KEY, LOGIN_REFRESH_TOKEN_KEY } = consts;

    loginMutation({ variables })
      .then(({ data }) => {
        const { token, refreshToken } = data.login;

        // save tokens
        localStorage.setItem(LOGIN_TOKEN_KEY, token);
        localStorage.setItem(LOGIN_REFRESH_TOKEN_KEY, refreshToken);

        apolloClient.resetStore();

        history.push('/');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    login
  };

  return <SignIn {...updatedProps} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, LoginMutationResponse, { LoginMutationVariables }>(
      gql(mutations.login),
      {
        name: 'loginMutation'
      }
    )
  )(withRouter<FinalProps>(SignInContainer))
);
