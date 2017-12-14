import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';

const propTypes = {
  addCustomer: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CustomerForm extends React.Component {
  constructor(props) {
    super(props);

    this.addCustomer = this.addCustomer.bind(this);
  }

  addCustomer(e) {
    e.preventDefault();

    this.props.addCustomer({
      doc: {
        firstName: document.getElementById('customer-firstname').value,
        lastName: document.getElementById('customer-lastname').value,
        email: document.getElementById('customer-email').value
      },

      callback: () => {
        this.context.closeModal();
      }
    });
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.addCustomer}>
        <FormGroup>
          <ControlLabel>First Name</ControlLabel>
          <FormControl id="customer-firstname" type="text" autoFocus required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Last Name</ControlLabel>
          <FormControl id="customer-lastname" type="text" required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <FormControl id="customer-email" type="text" required />
        </FormGroup>

        <Modal.Footer>
          <Button btnStyle="simple" onClick={onClick}>
            <Icon icon="close" />
            Cancel
          </Button>

          <Button btnStyle="success" type="submit">
            <Icon icon="checkmark" />
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

CustomerForm.propTypes = propTypes;
CustomerForm.contextTypes = contextTypes;

export default CustomerForm;
