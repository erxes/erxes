import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';
import { FormWrapper, FormColumn, ColumnTitle } from '../../styles';

const propTypes = {
  addCustomer: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func,
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
    const { __, closeModal } = this.context;

    return (
      <form onSubmit={e => this.addCustomer(e)}>
        <FormWrapper>
          <FormColumn>
            <ColumnTitle>{__('Basics')}</ColumnTitle>
            <FormGroup>
              <ControlLabel>First Name</ControlLabel>
              <FormControl
                id="customer-firstname"
                type="text"
                autoFocus
                required
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Last Name</ControlLabel>
              <FormControl id="customer-lastname" type="text" />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <FormControl id="customer-email" type="email" required />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Phone</ControlLabel>
              <FormControl id="customer-phone" type="email" />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <FormControl id="customer-owner" type="email" />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Position</ControlLabel>
              <FormControl id="customer-position" type="email" />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Department</ControlLabel>
              <FormControl id="customer-department" type="email" />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Lead Status</ControlLabel>
              <FormControl id="customer-leadStatus" componentClass="select">
                <option />
                <option>New</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Open Deal</option>
                <option>Unqualified</option>
                <option>Attempted to Contact</option>
                <option>Connected</option>
                <option>Bad Timing</option>
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Lifecycle State</ControlLabel>
              <FormControl id="customer-lifecycleState" componentClass="select">
                <option />
                <option>Subscriber</option>
                <option>Lead</option>
                <option>Marketing Qualified Lead</option>
                <option>Sales Qualified Lead</option>
                <option>Opportunity</option>
                <option>Customer</option>
                <option>Evangelist</option>
                <option>Other</option>
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Has Authority</ControlLabel>
              <FormControl id="customer-hasAuthority" type="email" />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl id="customer-description" type="email" />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Do not disturb</ControlLabel>
              <FormControl id="customer-doNotDisturb" type="email" />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <ColumnTitle>{__('Links')}</ColumnTitle>
            <FormGroup>
              <ControlLabel>Linked In</ControlLabel>
              <FormControl id="customer-linkedin" type="email" />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Twitter</ControlLabel>
              <FormControl id="customer-twitter" type="email" />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Facebook</ControlLabel>
              <FormControl id="customer-facebook" type="email" />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Github</ControlLabel>
              <FormControl id="customer-github" type="email" />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Youtube</ControlLabel>
              <FormControl id="customer-youtube" type="email" />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Website</ControlLabel>
              <FormControl id="customer-website" type="email" />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={() => closeModal()} icon="close">
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
