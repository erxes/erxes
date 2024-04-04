import { AuthBox } from "../styles";
import ControlLabel from "../../common/form/Label";
import Form from "../../common/form/Form";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import { IButtonMutateProps } from "../../common/types";
import Link from "next/link";
import React from "react";
import _ from "lodash";
import { __ } from "../../../utils";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class SignIn extends React.Component<Props> {
  renderContent = (formProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel uppercase={false}>{__("Email")}</ControlLabel>
          <FormControl
            {...formProps}
            name="email"
            type="email"
            placeholder={__("Enter your email address")}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel uppercase={false}>{__("Password")}</ControlLabel>
          <FormControl
            {...formProps}
            name="password"
            type="password"
            placeholder={__("Enter your password")}
            required={true}
          />
        </FormGroup>

        {this.props.renderButton({
          values,
          isSubmitted,
        })}
      </>
    );
  };

  render() {
    return (
      <AuthBox>
        <h2>{__("Welcome!")}</h2>
        <p>{__("Please sign in to your account to continue")}</p>
        <Form renderContent={this.renderContent} />
        <Link href="/forgotPassword">{__("Forgot password?")}</Link>
      </AuthBox>
    );
  }
}

export default SignIn;
