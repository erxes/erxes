import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'modules/common/components';

const propTypes = {
  onSuccess: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class PasswordConfirmation extends Component {
  constructor(props) {
    super(props);

    this.submit = this.submit.bind(this);
  }

  submit() {
    const password = document.getElementById('password').value;
    this.props.onSuccess(password);
    this.context.closeModal();
  }

  render() {
    return (
      <form>
        <FormGroup>
          <ControlLabel>Please Enter your password to confirm</ControlLabel>
          <FormControl autoFocus id="password" type="password" />
        </FormGroup>
        <Modal.Footer>
          <Button
            btnStyle="simple"
            icon="close"
            onClick={() => this.context.closeModal()}
          >
            Cancel
          </Button>
          <Button
            btnStyle="success"
            icon="checkmark"
            onClick={() => this.submit()}
          >
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

PasswordConfirmation.propTypes = propTypes;
PasswordConfirmation.contextTypes = contextTypes;

export default PasswordConfirmation;
