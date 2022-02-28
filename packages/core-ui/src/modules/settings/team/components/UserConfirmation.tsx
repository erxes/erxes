import { AuthBox } from "@erxes/ui/src/auth/styles";
import { IUser } from "@erxes/ui/src/auth/types";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { __ } from "modules/common/utils";
import AuthLayout from "@erxes/ui/src/layout/components/AuthLayout";
import React from "react";

class Confirmation extends React.Component<{
  confirmUser: ({
    password,
    passwordConfirmation,
    fullName,
    username,
  }: {
    password: string;
    passwordConfirmation: string;
    fullName: string;
    username: string;
  }) => void;
  currentUser?: IUser;
}> {
  onSubmit = (e) => {
    e.preventDefault();

    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    const passwordConfirmation = (document.getElementById(
      "passwordConfirmation"
    ) as HTMLInputElement).value;

    const fullName = (document.getElementById("fullName") as HTMLInputElement)
      .value;

    const username = (document.getElementById("username") as HTMLInputElement)
      .value;

    this.props.confirmUser({
      fullName,
      username,
      password,
      passwordConfirmation,
    });
  };

  renderContent() {
    return (
      <AuthBox>
        <h2>{__("Set up your password")}</h2>
        <form onSubmit={this.onSubmit}>
          <FormGroup>
            <ControlLabel>{__("Full name")}</ControlLabel>
            <FormControl id="fullName" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Username")}</ControlLabel>
            <FormControl id="username" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("New Password")}</ControlLabel>
            <FormControl type="password" id="password" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__("Re-type Password to confirm")}</ControlLabel>
            <FormControl type="password" id="passwordConfirmation" />
          </FormGroup>
          <Button btnStyle="success" type="submit" block={true}>
            Submit
          </Button>
        </form>
      </AuthBox>
    );
  }

  render() {
    if (this.props.currentUser) {
      return (
        <div style={{ width: "50%", margin: "auto" }}>
          {this.renderContent()}
        </div>
      );
    }

    return <AuthLayout content={this.renderContent()} />;
  }
}

export default Confirmation;
