import { LoginFormWrapper, WithIconFormControl } from "../../styles/form";
import React, { useState } from "react";

import Form from "../../common/form/Form";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import { IButtonMutateProps } from "../../common/types";
import Icon from "../../common/Icon";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  setResetPassword: (value: boolean) => void;
  setLogin: (value: boolean) => void;
};

function ForgotPassword({ renderButton, setResetPassword, setLogin }: Props) {
  const onSignin = () => {
    setResetPassword(false);
    setLogin(true);
  };

  const renderContent = (formProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <WithIconFormControl>
            <Icon icon="envelope-alt" size={26} />
            <FormControl
              {...formProps}
              name="email"
              type="email"
              placeholder={"Enter your email"}
              required={true}
            />
          </WithIconFormControl>
        </FormGroup>

        <FormGroup>
          {renderButton({
            values,
            isSubmitted,
          })}
        </FormGroup>

        <div className="auth-divider" />

        <div className="text-center">
          Already have an account?{" "}
          <span className="text-link" onClick={onSignin}>
            Sign in
          </span>
        </div>
      </>
    );
  };

  return (
    <LoginFormWrapper>
      <h2>{"Reset password"} &nbsp;</h2>
      <p>{"Enter your email to reset your password"}</p>

      <Form renderContent={renderContent} />
    </LoginFormWrapper>
  );
}

export default ForgotPassword;
