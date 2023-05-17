import { LoginFormWrapper, WithIconFormControl } from "../../styles/form";
import React, { useState } from "react";

import Form from "../../common/form/Form";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import { IButtonMutateProps } from "../../common/types";
import Icon from "../../common/Icon";

type Props = {
  handleCode: (phone: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  setResetPassword: (value: boolean) => void;
  setLogin: (value: boolean) => void;
};

function ResetPassword({
  renderButton,
  handleCode,
  setResetPassword,
  setLogin,
}: Props) {
  const [phone, changePhone] = useState("");

  const handleSubmit = (e) => {
    handleCode(phone);
    e.isDefaultPrevented();
  };

  const onChange = (e) => {
    changePhone(e.target.value);
    e.isDefaultPrevented();
  };

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
            <Icon icon="phone-alt" size={26} />
            <FormControl
              {...formProps}
              name="phone"
              placeholder={"Enter your phone number"}
              onChange={onChange}
            />
          </WithIconFormControl>
        </FormGroup>

        <FormGroup>
          <WithIconFormControl>
            <Icon icon="dialpad-alt" size={28} />
            <FormControl
              {...formProps}
              name="code"
              type="code"
              placeholder={"Enter your code"}
              required={true}
            />
          </WithIconFormControl>
        </FormGroup>

        <FormGroup>
          <WithIconFormControl>
            <Icon icon="lock-alt" size={28} />
            <FormControl
              {...formProps}
              name="password"
              type="password"
              placeholder={"Enter your password"}
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
      <p>{"Enter your phone number to reset your password"}</p>

      <Form renderContent={renderContent} />
    </LoginFormWrapper>
  );
}

export default ResetPassword;
