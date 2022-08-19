import { IUser } from '@erxes/ui/src/auth/types';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  object: IUser;
  save: ({
    _id,
    newPassword,
    repeatPassword
  }: {
    _id: string;
    newPassword: string;
    repeatPassword: string;
  }) => void;
  closeModal: () => void;
};

class UserResetPasswordForm extends React.Component<Props> {
  generateDoc = () => {
    return {
      _id: this.props.object._id,
      newPassword: (document.getElementById('new-password') as HTMLInputElement)
        .value,
      repeatPassword: (document.getElementById(
        'repeat-password'
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
          <ControlLabel>New Password</ControlLabel>

          <FormControl
            type="password"
            placeholder={__('Enter new password')}
            id="new-password"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Repeat Password</ControlLabel>

          <FormControl
            type="password"
            placeholder={__('repeat password')}
            id="repeat-password"
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="check-circle">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default UserResetPasswordForm;
