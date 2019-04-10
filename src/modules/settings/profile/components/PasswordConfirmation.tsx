import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import * as React from 'react';

type Props = {
  onSuccess: (password: string) => void;
  closeModal: () => void;
};

class PasswordConfirmation extends React.Component<Props> {
  submit = (e: React.FormEvent) => {
    e.preventDefault();

    const password = (document.getElementById('password') as HTMLInputElement)
      .value;

    this.props.onSuccess(password);

    this.props.closeModal();
  };

  render() {
    return (
      <form onSubmit={this.submit}>
        <FormGroup>
          <ControlLabel>Enter your password to Confirm</ControlLabel>
          <FormControl autoFocus={true} id="password" type="password" />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>
          <Button btnStyle="success" icon="checked-1" onClick={this.submit}>
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default PasswordConfirmation;
