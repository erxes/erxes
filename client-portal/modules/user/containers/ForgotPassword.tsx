import { gql, useMutation } from "@apollo/client";

import ButtonMutate from "../../common/ButtonMutate";
import ForgotPassword from "../components/ForgotPassword";
import { IButtonMutateProps } from "../../common/types";
import React from "react";
import mutations from "../graphql/mutations";

type Props = {
  setResetPassword: (value: boolean) => void;
  setLogin: (value: boolean) => void;
  clientPortalId: string;
};

function ForgotPasswordContainer(props: Props) {
  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => (window.location.href = "/");

    values.phone = values?.phone && values?.phone.toString();
    values.clientPortalId = props.clientPortalId;

    return (
      <ButtonMutate
        mutation={mutations.forgotPassword}
        variables={values}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage="Successfully send! Check your email"
        block={true}
        uppercase={true}
        icon={false}
      >
        Reset password
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <ForgotPassword {...updatedProps} />;
}

export default ForgotPasswordContainer;
