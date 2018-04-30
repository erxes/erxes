import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';

const propTypes = {
  save: PropTypes.func.isRequired
};

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      currentPassword: document.getElementById('current-password').value,
      newPassword: document.getElementById('new-password').value,
      confirmation: document.getElementById('new-password-confirmation').value
    });

    this.context.closeModal();
  }

  render() {
    const { __, closeModal } = this.context;

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
            onClick={() => closeModal()}
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

ChangePassword.propTypes = propTypes;
ChangePassword.contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func
};

export default ChangePassword;
