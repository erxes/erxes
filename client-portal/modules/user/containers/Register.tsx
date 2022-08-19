import React from "react";
import { mutations } from "../graphql";
import Register from "../components/Register";
import { IButtonMutateProps } from "../../common/types";
import ButtonMutate from "../../common/ButtonMutate";
import { getEnv } from "../../../utils/configs";
import { AppConsumer } from "../../appContext";
import { Store } from "../../types";

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
      {({ config }: Store) => {
        return (
          <Register {...{config, ...updatedProps}} />
        );
      }}
    </AppConsumer>
  )
}

export default RegisterContainer;
