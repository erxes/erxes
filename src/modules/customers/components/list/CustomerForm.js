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
    const firstName = document.getElementById('customer-firstname');
    const lastName = document.getElementById('customer-lastname');
    const email = document.getElementById('customer-email');

    this.props.addCustomer({
      doc: {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value
      },

      callback: () => {
        firstName.value = '';
        lastName.value = '';
        email.value = '';
        if (document.activeElement.name === 'close') this.context.closeModal();
      }
    });
  }

  render() {
    return (
      <form onSubmit={e => this.addCustomer(e)}>
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
          <FormControl id="customer-email" type="email" required />
        </FormGroup>

        <Modal.Footer>
          <Button btnStyle="success" type="submit">
            <Icon icon="checkmark" />
            Save & New
          </Button>

          <Button btnStyle="primary" type="submit" name="close">
            <Icon icon="close" />
            Save & Close
          </Button>

          <Button btnStyle="simple" onClick={() => this.context.closeModal()}>
            <Icon icon="close" />
            Close
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

CustomerForm.propTypes = propTypes;
CustomerForm.contextTypes = contextTypes;

export default CustomerForm;
