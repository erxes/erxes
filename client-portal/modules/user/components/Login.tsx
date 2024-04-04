import {
  LoginFormWrapper,
  SocialLogin,
  WithIconFormControl,
} from "../../styles/form";
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

type Props = {
  config: Config;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  hasCompany: boolean;
  facebookLoginResponse: (accessToken: string, clientPortalId: string) => void;
  setRegister: (value: boolean) => void;
  setResetPassword: (value: boolean) => void;
  setLogin: (value: boolean) => void;
  infoText?: string;
};

function Login({
  config,
  renderButton,
  hasCompany,
  infoText,
  facebookLoginResponse,
  setRegister,
  setLogin,
  setResetPassword,
}: Props) {
  const [type, changeType] = useState(LOGIN_TYPES.CUSTOMER);

  const onChange = (e) => {
    changeType(e.target.value);
    e.isDefaultPrevented();
  };

  const onSignup = () => {
    setLogin(false);
    setRegister(true);
  };

  const onResetPassword = () => {
    setLogin(false);
    setResetPassword(true);
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
          <WithIconFormControl>
            <Icon icon="envelope-alt" size={26} />
            <FormControl
              {...formProps}
              name="email"
              placeholder={"Enter your email"}
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
            values: { ...values, type, clientPortalId: config._id },
            isSubmitted,
          })}
        </FormGroup>

        <div className="text-center text-link" onClick={onResetPassword}>
          Forget your password?
        </div>

        <div className="auth-divider" />

        {config.googleClientId && (
          <SocialLogin>
            <FormGroup>
              <GoogleLoginButton>
                <a href={getGoogleUrl("/", config)}>Google</a>
              </GoogleLoginButton>
            </FormGroup>
          </SocialLogin>
        )}
        {config.facebookAppId && (
          <SocialLogin>
            <FormGroup>
              <FacebookLogin
                appId={config.facebookAppId || ""}
                callback={responseFacebook}
                icon="fa-facebook"
              />
            </FormGroup>
          </SocialLogin>
        )}

        <div className="text-center">
          Don't have an account?{" "}
          <span className="text-link" onClick={onSignup}>
            Sign up
          </span>
        </div>
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
