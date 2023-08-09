import { AppConsumer } from "../../appContext";
import ButtonMutate from "../../common/ButtonMutate";
import { IButtonMutateProps } from "../../common/types";
import Login from "../components/Login";
import React from "react";
import { Store } from "../../types";
import { detect } from "detect-browser";
import { getEnv } from "../../../utils/configs";
import gql from "graphql-tag";
import { mutations } from "../graphql";
import { useMutation } from "@apollo/client";

type Props = {
  infoText?: string;
  setRegister: (value: boolean) => void;
  setResetPassword: (value: boolean) => void;
  setLogin: (value: boolean) => void;
};

function LoginContainer(props: Props) {
  const browser = detect();

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = (data) => {
      if (data.clientPortalLogin && typeof window !== 'undefined') {
        const { token, refreshToken } = data.clientPortalLogin;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('refreshToken', refreshToken);
      }
      window.location.href = "/";
    };

    return (
      <ButtonMutate
        mutation={mutations.login}
        variables={{
          ...values,
          description: `${browser.os}, ${browser.type}: ${browser.name}`,
        }}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        block={true}
        uppercase={true}
        type="submit"
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
    if (accessToken && clientPortalId) {
      return getVerificationCode({
        variables: { accessToken, clientPortalId },
      })
        .then(() => {
          window.location.href = "/";
        })
        .catch((e) => {
          console.error("error: ", e.message);
        });
    }

    return null;
  };

  const updatedProps = {
    ...props,
    hasCompany: getEnv().REACT_APP_HAS_COMPANY === "true",
    renderButton,
    facebookLoginResponse,
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
