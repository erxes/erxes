import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
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
            uppercase={false}
          >
            Close
          </Button>

          <Button
            btnStyle="success"
            type="submit"
            icon="check-circle"
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default UserResetPasswordForm;
