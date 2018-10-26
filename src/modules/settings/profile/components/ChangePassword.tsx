import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';

type Props = {
  save: (
    save: { currentPassword: string; newPassword: string; confirmation: string }
  ) => void;
  closeModal: () => void;
};

class ChangePassword extends React.Component<Props> {
  handleSubmit = e => {
    e.preventDefault();

    this.props.save({
      currentPassword: (document.getElementById(
        'current-password'
      ) as HTMLInputElement).value,
      newPassword: (document.getElementById('new-password') as HTMLInputElement)
        .value,
      confirmation: (document.getElementById(
        'new-password-confirmation'
      ) as HTMLInputElement).value
    });

    this.props.closeModal();
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Current Password</ControlLabel>
          <FormControl
            type="password"
            placeholder={__('Current password')}
            id="current-password"
          />
        </FormGroup>

        <br />

        <FormGroup>
          <ControlLabel>New Password</ControlLabel>
          <FormControl
            type="password"
            placeholder={__('Enter new password')}
            id="new-password"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Re-type Password to confirm</ControlLabel>
          <FormControl
            type="password"
            placeholder={__('Re-type password')}
            id="new-password-confirmation"
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default ChangePassword;
