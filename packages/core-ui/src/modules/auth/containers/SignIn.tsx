import ButtonMutate from "../../common/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import SignIn from "../components/SignIn";
import { __ } from "modules/common/utils";
import apolloClient from "apolloClient";
import { mutations } from "../graphql";
import { useLocation, useNavigate } from "react-router-dom";

const SignInContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => {
      apolloClient.resetStore();

      navigate(
        (!location.pathname.includes("sign-in") &&
          `${location.pathname}${location.search}`) ||
          "/?signedIn=true"
      );

      window.location.reload();
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
    renderButton
  };

  return <SignIn {...updatedProps} />;
};

export default SignInContainer;
