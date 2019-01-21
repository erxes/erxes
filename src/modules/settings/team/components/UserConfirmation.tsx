import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { AuthBox } from '../../../auth/styles';
import { Box, MiddleContent, Title } from '../../status/styles';

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

  render() {
    return (
      <AuthBox>
        <h2>{__('Welcome')}</h2>
        <form onSubmit={this.onSubmit}>
          <FullContent center={true}>
            <MiddleContent>
              <Box>
                <Title>{__('Set up your password')}</Title>
                <FormGroup>
                  <ControlLabel>Password</ControlLabel>

                  <FormControl type="password" id="password" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Password Confirmation</ControlLabel>

                  <FormControl type="password" id="passwordConfirmation" />
                </FormGroup>
                <FormGroup>
                  <Button type="submit">Submit</Button>
                </FormGroup>
              </Box>
            </MiddleContent>
          </FullContent>
        </form>
      </AuthBox>
    );
  }
}

export default Confirmation;
