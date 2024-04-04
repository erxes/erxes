import ButtonMutate from "../../common/ButtonMutate";
import { IButtonMutateProps } from "../../common/types";
import React from "react";
import SignIn from "../components/SignIn";
import { __ } from "../../../utils";
import apolloClient from "../../apolloClient";
import { mutations } from "../graphql";

const SignInContainer = () => {
  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => {
      apolloClient.resetStore();

      window.location.href = "/";
    };

    return (
      <ButtonMutate
        mutation={mutations.login}
        variables={values}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        btnStyle="default"
        block={true}
        icon="none"
      >
        {__("Sign in")}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    renderButton,
  };

  return <SignIn {...updatedProps} />;
};

export default SignInContainer;
