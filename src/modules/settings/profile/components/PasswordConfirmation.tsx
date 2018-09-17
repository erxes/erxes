import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import React, { Component } from 'react';

type Props = {
  onSuccess: (password: string) => void,
  closeModal?: () => void
};

class PasswordConfirmation extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.submit = this.submit.bind(this);
  }

  submit(e) {
    e.preventDefault();

    const password = (document.getElementById('password') as HTMLInputElement).value;

    this.props.onSuccess(password);
    this.props.closeModal();
  }

  render() {
    return (
      <form onSubmit={e => this.submit(e)}>
        <FormGroup>
          <ControlLabel>Enter your password to Confirm</ControlLabel>
          <FormControl autoFocus id="password" type="password" />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>
          <Button
            btnStyle="success"
            icon="checked-1"
            onClick={e => this.submit(e)}
          >
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default PasswordConfirmation;
