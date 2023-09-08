import { gql, useMutation } from "@apollo/client";
import React from "react";
import ResetPassword from "../components/ResetPassword";
import mutations from "../graphql/mutations";
import { IButtonMutateProps } from "../../common/types";
// import ButtonMutate from "../../common/ButtonMutate";

function ResetPasswordContainer() {
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

    return null;

    // return (
    //   <ButtonMutate
    //     mutation={mutations.resetPassword}
    //     variables={values}
    //     callback={callbackResponse}
    //     isSubmitted={isSubmitted}
    //     type="submit"
    //     btnStyle="warning"
    //     successMessage="Succesfully"
    //     block={true}
    //     uppercase={true}
    //     icon={false}
    //   >
    //     Reset password
    //   </ButtonMutate>
    // );
  };

  const updatedProps = {
    handleCode,
    renderButton,
  };

  return <ResetPassword {...updatedProps} />;
}

export default ResetPasswordContainer;
