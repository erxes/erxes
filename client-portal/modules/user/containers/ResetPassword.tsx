import { gql, useMutation } from "@apollo/client";

import ButtonMutate from "../../common/ButtonMutate";
import { IButtonMutateProps } from "../../common/types";
import React from "react";
import ResetPassword from "../components/ResetPassword";
import mutations from "../graphql/mutations";

type Props = {
  setResetPassword: (value: boolean) => void;
  setLogin: (value: boolean) => void;
};

function ResetPasswordContainer(props: Props) {
  const [getVerificationCode] = useMutation(gql(mutations.getCode));

  const handleCode = (phone: string) => {
    getVerificationCode({
      variables: { phone },
    }).then((data) => {
      console.log("sent verification code");
    });
  };

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => (window.location.href = "/");

    return (
      <ButtonMutate
        mutation={mutations.resetPassword}
        variables={values}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage="Success!"
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
    handleCode,
    renderButton,
  };

  return <ResetPassword {...updatedProps} />;
}

export default ResetPasswordContainer;
