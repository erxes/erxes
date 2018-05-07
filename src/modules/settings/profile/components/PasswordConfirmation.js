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

  submit(doc) {
    this.props.onSuccess(doc.password);
    this.context.closeModal();
  }

  render() {
    return (
      <Form onSubmit={e => this.submit(e)}>
        <FormGroup>
          <ControlLabel>Enter your password to Confirm</ControlLabel>
          <FormControl
            autoFocus
            name="password"
            validations="isValue"
            validationError="Please enter a password"
            type="password"
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={() => this.context.closeModal()}
          >
            Cancel
          </Button>
          <Button btnStyle="success" icon="checked-1" type="submit">
            Save
          </Button>
        </ModalFooter>
      </Form>
    );
  }
}

PasswordConfirmation.propTypes = propTypes;
PasswordConfirmation.contextTypes = contextTypes;

export default PasswordConfirmation;
