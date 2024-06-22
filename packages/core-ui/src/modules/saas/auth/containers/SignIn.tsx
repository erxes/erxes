import React from "react";

import apolloClient from "apolloClient";
import { __ } from "modules/common/utils";

import { IButtonMutateProps } from "@erxes/ui/src/types";
import SignIn from "../components/SignIn";
import { mutations } from "../graphql";
import withCurrentOrganization from "@erxes/ui-settings/src/general/saas/containers/withCurrentOrganization";
import ButtonMutate from "../../../common/components/ButtonMutate";
import { useLocation, useNavigate } from "react-router-dom";

type FinalProps = {
  currentOrganization: any;
};

const SignInContainer = (props: FinalProps) => {
  const { currentOrganization } = props;
  const location = useLocation();
  const navigate = useNavigate();

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
        style={{ background: `${currentOrganization.backgroundColor}` }}
      >
        {__("Sign in")}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <SignIn {...updatedProps} />;
};

export default withCurrentOrganization(SignInContainer);
