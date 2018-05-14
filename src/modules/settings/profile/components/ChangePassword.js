import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
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

  handleSubmit(doc) {
    this.props.save({
      currentPassword: doc.currentPassword,
      newPassword: doc.newPassword,
      confirmation: doc.newPasswordConfirmation
    });

    this.context.closeModal();
  }

  render() {
    const { __, closeModal } = this.context;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Current Password</ControlLabel>
          <FormControl
            type="password"
            placeholder={__('Current password')}
            validations="isValue"
            validationError="Please enter a current password"
            name="currentPassword"
          />
        </FormGroup>

        <br />

        <FormGroup>
          <ControlLabel>New Password</ControlLabel>
          <FormControl
            type="password"
            placeholder={__('Enter new password')}
            validations="isValue"
            validationError="Please enter a new password"
            name="newPassword"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Re-type Password to confirm</ControlLabel>
          <FormControl
            type="password"
            placeholder={__('Re-type password')}
            name="newPasswordConfirmation"
            validations="isValue"
            validationError="Please re-type password"
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
      </Form>
    );
  }
}

ChangePassword.propTypes = propTypes;
ChangePassword.contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func
};

export default ChangePassword;
