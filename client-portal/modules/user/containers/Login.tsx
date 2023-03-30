import React from 'react';
import { mutations } from '../graphql';
import Login from '../components/Login';
import { IButtonMutateProps } from '../../common/types';
import ButtonMutate from '../../common/ButtonMutate';
import { getEnv } from '../../../utils/configs';
import { detect } from 'detect-browser';
import { AppConsumer } from '../../appContext';
import { Store } from '../../types';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';

type Props = {
  infoText?: string;
};

function LoginContainer(props: Props) {
  const browser = detect();

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => {
      window.location.href = '/';
    };

    return (
      <ButtonMutate
        mutation={mutations.login}
        variables={{
          ...values,
          description: `${browser.os}, ${browser.type}: ${browser.name}`
        }}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        block={true}
        uppercase={true}
        btnStyle='warning'
        type='submit'
      >
        Sign in
      </ButtonMutate>
    );
  };

  const [getVerificationCode] = useMutation(gql(mutations.facebookLogin));

  const facebookLoginResponse = (
    accessToken: string,
    clientPortalId: string
  ) => {
    accessToken &&
      clientPortalId &&
      getVerificationCode({
        variables: { accessToken, clientPortalId }
      })
        .then(() => {
          window.location.href = '/';
        })
        .catch((e) => {
          console.error('error: ', e.message);
        });
  };

  const updatedProps = {
    ...props,
    hasCompany: getEnv().REACT_APP_HAS_COMPANY === 'true',
    renderButton,
    facebookLoginResponse
  };

  return (
    <AppConsumer>
      {({ config }: Store) => {
        return <Login {...{ config, ...updatedProps }} />;
      }}
    </AppConsumer>
  );
}

export default LoginContainer;
