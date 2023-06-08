import { gql, useMutation } from "@apollo/client";

import ButtonMutate from "../../common/ButtonMutate";
import { IButtonMutateProps } from "../../common/types";
import React from "react";
import ResetPassword from "../components/ResetPassword";
import mutations from "../graphql/mutations";

type Props = {
  token: string;
};

function ResetPasswordContainer(props: Props) {
  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => (window.location.href = "/");

    values.token = props.token;

    return (
      <ButtonMutate
        mutation={mutations.resetPassword}
        variables={values}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage="Successfully reset your password! Go login again!"
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

  return <ResetPassword {...updatedProps} />;
}

export default ResetPasswordContainer;
