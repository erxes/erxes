import React, { useState } from "react";
import { LoginFormWrapper } from "../../styles/form";
import FormControl from "../../common/form/Control";
import Form from "../../common/form/Form";
import FormGroup from "../../common/form/Group";
import { IButtonMutateProps } from "../../common/types";
import Icon from "../../common/Icon";

type Props = {
  handleCode: (phone: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

function ResetPassword({ renderButton, handleCode }: Props) {
  const [phone, changePhone] = useState("");

  const handleSubmit = (e) => {
    handleCode(phone);
    e.isDefaultPrevented();
  };

  const onChange = (e) => {
    changePhone(e.target.value);
    e.isDefaultPrevented();
  };

  const renderContent = (formProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <FormControl
            {...formProps}
            name="phone"
            placeholder={"Phone"}
            onChange={onChange}
          />
        </FormGroup>

        <FormGroup>
          <FormControl
            {...formProps}
            name="code"
            type="code"
            placeholder={"code"}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <FormControl
            {...formProps}
            name="password"
            type="password"
            placeholder={"password"}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          {renderButton({
            values,
            isSubmitted,
          })}
        </FormGroup>
      </>
    );
  };

  return (
    <LoginFormWrapper>
      <h2>{"Reset password"} &nbsp;</h2>
      <Form renderContent={renderContent} />
    </LoginFormWrapper>
  );
}

export default ResetPassword;
