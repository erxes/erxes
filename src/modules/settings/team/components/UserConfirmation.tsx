import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
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
      <form onSubmit={this.onSubmit}>
        <FullContent center={true}>
          <MiddleContent>
            <Box>
              <Title>{__('Set up your password')}</Title>
              <FormGroup>
                <ControlLabel>Password</ControlLabel>

                <FormControl id="password" />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Password Confirmation</ControlLabel>

                <FormControl id="passwordConfirmation" />
              </FormGroup>
            </Box>
          </MiddleContent>
        </FullContent>
        <Button type="submit">Submit</Button>
      </form>
    );
  }
}

export default Confirmation;
