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
        document.getElementById('customer-firstname').value = '';
        document.getElementById('customer-lastname').value = '';
        document.getElementById('customer-email').value = '';
      }
    });
  }

  render() {
    const onClick = e => {
      this.addCustomer(e);
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
          <Button btnStyle="simple" onClick={e => onClick(e)}>
            <Icon icon="close" />
            Save&Close
          </Button>

          <Button btnStyle="success" onClick={e => this.addCustomer(e)}>
            <Icon icon="checkmark" />
            Save&New
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

CustomerForm.propTypes = propTypes;
CustomerForm.contextTypes = contextTypes;

export default CustomerForm;
