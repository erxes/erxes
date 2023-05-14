import React, { useState } from "react";
import { __, getGoogleUrl } from "../../../utils";

import { Config } from "../../types";
import FacebookLogin from "react-facebook-login";
import Form from "../../common/form/Form";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import { GoogleLoginButton } from "react-social-login-buttons";
import { IButtonMutateProps } from "../../common/types";
import Icon from "../../common/Icon";
import { LOGIN_TYPES } from "../types";
import { LoginFormWrapper } from "../../styles/form";

type Props = {
  config: Config;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  hasCompany: boolean;
  infoText?: string;
  facebookLoginResponse: (accessToken: string, clientPortalId: string) => void;
};

function Login({
  config,
  renderButton,
  hasCompany,
  infoText,
  facebookLoginResponse,
}: Props) {
  const [type, changeType] = useState(LOGIN_TYPES.CUSTOMER);

  const onChange = (e) => {
    changeType(e.target.value);
    e.isDefaultPrevented();
  };
  const responseFacebook = (response) => {
    const { accessToken } = response;
    facebookLoginResponse(accessToken, config._id);
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

        {config.googleClientId && (
          <FormGroup>
            <GoogleLoginButton>
              <a href={getGoogleUrl("/", config)}>Google</a>
            </GoogleLoginButton>
          </FormGroup>
        )}
        {config.facebookAppId && (
          <FormGroup>
            <FacebookLogin
              appId={config.facebookAppId || ""}
              callback={responseFacebook}
              icon="fa-facebook"
            />
          </FormGroup>
        )}
      </>
    );
  };

  return (
    <LoginFormWrapper>
      <h2>{__("Sign in")}</h2>
      <p>{__("Login to your account to continue the process")}</p>
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
