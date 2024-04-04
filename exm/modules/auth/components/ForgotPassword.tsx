import { AuthBox } from "../styles";
import Button from "../../common/Button";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import Link from "next/link";
import React from "react";
import { __ } from "../../../utils";
import { getThemeItem } from "../../utils";
import { readFile } from "../../common/utils";

type Props = {
  forgotPassword: (
    doc: { email: string },
    callback: (e: Error) => void
  ) => void;
};

class ForgotPassword extends React.Component<Props, { email: string }> {
  constructor(props) {
    super(props);

    this.state = { email: "" };
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { email } = this.state;

    this.props.forgotPassword({ email }, (err) => {
      if (!err) {
        window.location.href = "/sign-in";
      }
    });
  };

  handleEmailChange = (e) => {
    e.preventDefault();
    this.setState({ email: e.target.value });
  };

  renderLogo() {
    const logo = "/images/logo-dark.png";
    const thLogo = getThemeItem("logo");
    return thLogo ? readFile(thLogo) : `/images/${logo}`;
  }

  render() {
    return (
      <AuthBox>
        <img src={this.renderLogo()} alt="erxes" />
        <h2>{__("Reset your password")}</h2>
        <p>{__("Please reset your password via email")}</p>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              type="email"
              placeholder={__("Enter your email")}
              value={this.state.email}
              required={true}
              onChange={this.handleEmailChange}
            />
          </FormGroup>
          <Button type="submit" block={true}>
            Email me the instruction
          </Button>
        </form>
        <Link href="/sign-in">{__("Sign in")}</Link>
      </AuthBox>
    );
  }
}

export default ForgotPassword;
