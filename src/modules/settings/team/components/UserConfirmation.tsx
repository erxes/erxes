import { AuthBox } from 'modules/auth/styles';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { AuthLayout } from 'modules/layout/components';
import React from 'react';

class Confirmation extends React.Component<{
  confirmUser: (
    {
      password,
      passwordConfirmation,
      fullName,
      username
    }: {
      password: string;
      passwordConfirmation: string;
      fullName: string;
      username: string;
    }
  ) => void;
}> {
  onSubmit = e => {
    e.preventDefault();

    const password = (document.getElementById('password') as HTMLInputElement)
      .value;

    const passwordConfirmation = (document.getElementById(
      'passwordConfirmation'
    ) as HTMLInputElement).value;

    const fullName = (document.getElementById('fullName') as HTMLInputElement)
      .value;

    const username = (document.getElementById('username') as HTMLInputElement)
      .value;

    this.props.confirmUser({
      fullName,
      username,
      password,
      passwordConfirmation
    });
  };

  renderContent() {
    return (
      <AuthBox>
        <h2>{__('Set up your password')}</h2>
        <form onSubmit={this.onSubmit}>
          <FormGroup>
            <ControlLabel>Full name</ControlLabel>
            <FormControl id="fullName" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Username</ControlLabel>
            <FormControl id="username" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Password</ControlLabel>
            <FormControl type="password" id="password" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Password Confirmation</ControlLabel>
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
    return <AuthLayout content={this.renderContent()} />;
  }
}

export default Confirmation;
