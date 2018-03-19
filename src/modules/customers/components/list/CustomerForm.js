import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';

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
          <FormControl id="customer-lastname" type="text" />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <FormControl id="customer-email" type="email" required />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={() => this.context.closeModal()}
            icon="close"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save & New
          </Button>

          <Button btnStyle="primary" type="submit" name="close" icon="close">
            Save & Close
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

CustomerForm.propTypes = propTypes;
CustomerForm.contextTypes = contextTypes;

export default CustomerForm;
