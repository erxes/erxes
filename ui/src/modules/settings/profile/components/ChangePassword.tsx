import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';

type Props = {
  save: ({
    currentPassword,
    newPassword,
    confirmation
  }: {
    currentPassword: string;
    newPassword: string;
    confirmation: string;
  }) => void;
  closeModal: () => void;
};

class ChangePassword extends React.Component<Props> {
  generateDoc = () => {
    return {
      currentPassword: (document.getElementById(
        'current-password'
      ) as HTMLInputElement).value,
      newPassword: (document.getElementById('new-password') as HTMLInputElement)
        .value,
      confirmation: (document.getElementById(
        'new-password-confirmation'
      ) as HTMLInputElement).value
    };
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.save(this.generateDoc());
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
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="check-circle" uppercase={false}>
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default ChangePassword;
