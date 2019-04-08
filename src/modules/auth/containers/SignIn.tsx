import apolloClient from 'apolloClient';
import gql from 'graphql-tag';
import { __, Alert, withProps } from 'modules/common/utils';
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
    loginMutation({ variables })
      .then(({ data }) => {
        const { token, refreshToken } = data.login;

        apolloClient.resetStore();

        history.push('/');
      })
      .catch(() => {
        Alert.error(
          __('The email address or password you entered is incorrect.')
        );
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
