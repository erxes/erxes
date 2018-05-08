import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'modules/common/components';

const propTypes = {
  onSuccess: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  show: PropTypes.bool
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
  }

  render() {
    const { show, close } = this.props;

    return (
      <Modal show={show} onHide={close}>
        <Form onSubmit={this.submit}>
          <Modal.Header closeButton>
            <Modal.Title>Enter your password to Confirm</Modal.Title>
          </Modal.Header>

          <Modal.Body>
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

            <Modal.Footer>
              <Button btnStyle="simple" icon="cancel-1" onClick={close}>
                Cancel
              </Button>
              <Button btnStyle="success" icon="checked-1" type="submit">
                Save
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Form>
      </Modal>
    );
  }
}

PasswordConfirmation.propTypes = propTypes;
PasswordConfirmation.contextTypes = contextTypes;

export default PasswordConfirmation;
