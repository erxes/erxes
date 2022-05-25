import React, { useState } from "react";
import { LoginFormWrapper } from "../../styles/form";
import FormControl from "../../common/form/Control";
import Form from "../../common/form/Form";
import FormGroup from "../../common/form/Group";
import { IButtonMutateProps } from "../../common/types";
import { LOGIN_TYPES } from "../types";
import Icon from "../../common/Icon";
import { Config } from "../../types";

type Props = {
  config: Config;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  hasCompany: boolean;
  infoText?: string;
};

function Login({ config, renderButton, hasCompany, infoText }: Props) {
  const [type, changeType] = useState(LOGIN_TYPES.CUSTOMER);

  const onChange = (e) => {
    changeType(e.target.value);
    e.isDefaultPrevented();
  };

  const renderContent = (formProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        {hasCompany && (
          <FormGroup>
            <FormControl componentClass="select" onChange={onChange}>
              <option value={LOGIN_TYPES.CUSTOMER}>Customer</option>
              <option value={LOGIN_TYPES.COMPANY}>Company</option>
            </FormControl>
          </FormGroup>
        )}

        <FormGroup>
          <FormControl
            {...formProps}
            name="email"
            placeholder={"registered@email.com"}
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
            values: { ...values, type, clientPortalId: config._id },
            isSubmitted,
          })}
        </FormGroup>
      </>
    );
  };

  return (
    <LoginFormWrapper>
      <h2>{"Sign in"}</h2>
      {infoText && (
        <div className="info">
          <Icon icon="info-circle" size={18} /> &nbsp; {infoText}
        </div>
      )}
      <Form renderContent={renderContent} />
    </LoginFormWrapper>
  );
}

export default Login;
