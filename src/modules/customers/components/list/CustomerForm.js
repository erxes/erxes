import React from 'react';
import PropTypes from 'prop-types';
import {
  ButtonToolbar,
  Modal,
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap';
import { Button } from 'modules/common/components';

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
        name: document.getElementById('customer-name').value,
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
          <ControlLabel>Name</ControlLabel>
          <FormControl id="customer-name" type="text" required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <FormControl id="customer-email" type="text" required />
        </FormGroup>

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button btnStyle="link" onClick={onClick}>
              Cancel
            </Button>

            <Button btnStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

CustomerForm.propTypes = propTypes;
CustomerForm.contextTypes = contextTypes;

export default CustomerForm;
