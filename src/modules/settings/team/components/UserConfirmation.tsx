import { AuthBox } from 'modules/auth/styles';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { AuthLayout } from 'modules/layout/components';
import * as React from 'react';

class Confirmation extends React.Component<{
  confirmUser: (
    {
      password,
      passwordConfirmation
    }: { password: string; passwordConfirmation: string }
  ) => void;
}> {
  onSubmit = e => {
    e.preventDefault();

    const password = (document.getElementById('password') as HTMLInputElement)
      .value;
    const passwordConfirmation = (document.getElementById(
      'passwordConfirmation'
    ) as HTMLInputElement).value;

    this.props.confirmUser({
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
