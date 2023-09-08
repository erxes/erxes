import { AppConsumer } from "../../appContext";
import ButtonMutate from "../../common/ButtonMutate";
import { IButtonMutateProps } from "../../common/types";
import React from "react";
import Register from "../components/Register";
import { getEnv } from "../../../utils/configs";
import { mutations } from "../graphql";

function RegisterContainer() {
  const { REACT_APP_HAS_COMPANY } = getEnv();

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => (window.location.href = "/");

    return (
      <ButtonMutate
        mutation={mutations.createUser}
        variables={values}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        btnStyle="warning"
        successMessage="Succesfully registered!"
        block={true}
        uppercase={true}
      >
        Register
      </ButtonMutate>
    );
  };

  const updatedProps = {
    hasCompany: REACT_APP_HAS_COMPANY === "true",
    renderButton,
  };

  return (
    <AppConsumer>
      {({ config }: any) => {
        return <Register {...{ config, ...updatedProps }} />;
      }}
    </AppConsumer>
  );
}

export default RegisterContainer;
