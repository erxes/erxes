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
  customer: PropTypes.object,
  action: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func.isRequired
};

class CustomerForm extends React.Component {
  constructor(props) {
    super(props);

    this.action = this.action.bind(this);
  }

  action(e) {
    e.preventDefault();

    const firstName = document.getElementById('customer-firstname');
    const lastName = document.getElementById('customer-lastname');
    const email = document.getElementById('customer-email');
    const owner = document.getElementById('customer-owner');
    const phone = document.getElementById('customer-phone');
    const position = document.getElementById('customer-position');
    const department = document.getElementById('customer-department');
    const leadStatus = document.getElementById('customer-leadStatus');
    const lifecycleState = document.getElementById('customer-lifecycleState');
    const hasAuthority = document.getElementById('customer-hasAuthority');
    const description = document.getElementById('customer-description');
    const doNotDisturb = document.getElementById('customer-doNotDisturb');
    const linkedIn = document.getElementById('customer-linkedin');
    const twitter = document.getElementById('customer-twitter');
    const facebook = document.getElementById('customer-facebook');
    const github = document.getElementById('customer-github');
    const youtube = document.getElementById('customer-youtube');
    const website = document.getElementById('customer-website');

    this.props.action({
      doc: {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        owner: owner.value,
        phone: phone.value,
        position: position.value,
        department: department.value,
        leadStatus: leadStatus.value,
        lifecycleState: lifecycleState.value,
        hasAuthority: hasAuthority.value,
        description: description.value,
        doNotDisturb: doNotDisturb.value,

        links: {
          linkedIn: linkedIn.value,
          twitter: twitter.value,
          facebook: facebook.value,
          github: github.value,
          youtube: youtube.value,
          website: website.value
        }
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
    const { customer = {} } = this.props;
    const { links = {} } = customer;

    return (
      <form onSubmit={e => this.action(e)}>
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
                defaultValue={customer.firstName || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Last Name</ControlLabel>
              <FormControl
                id="customer-lastname"
                type="text"
                defaultValue={customer.lastName || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <FormControl
                id="customer-email"
                type="email"
                defaultValue={customer.email || ''}
                required
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Phone</ControlLabel>
              <FormControl
                id="customer-phone"
                defaultValue={customer.phone || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <FormControl
                id="customer-owner"
                defaultValue={customer.ownerId || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Position</ControlLabel>
              <FormControl
                id="customer-position"
                defaultValue={customer.position || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Department</ControlLabel>
              <FormControl
                id="customer-department"
                defaultValue={customer.department || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Lead Status</ControlLabel>
              <FormControl
                id="customer-leadStatus"
                componentClass="select"
                defaultValue={customer.leadStatus || ''}
              >
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
              <FormControl
                id="customer-lifecycleState"
                componentClass="select"
                defaultValue={customer.lifecycleState || ''}
              >
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
              <FormControl
                id="customer-hasAuthority"
                defaultValue={customer.hasAuthority || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                id="customer-description"
                defaultValue={customer.description || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Do not disturb</ControlLabel>
              <FormControl
                id="customer-doNotDisturb"
                defaultValue={customer.doNotDisturb || ''}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <ColumnTitle>{__('Links')}</ColumnTitle>
            <FormGroup>
              <ControlLabel>Linked In</ControlLabel>
              <FormControl
                id="customer-linkedin"
                defaultValue={links.linkedIn || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Twitter</ControlLabel>
              <FormControl
                id="customer-twitter"
                defaultValue={links.twitter || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Facebook</ControlLabel>
              <FormControl
                id="customer-facebook"
                defaultValue={links.facebook || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Github</ControlLabel>
              <FormControl
                id="customer-github"
                defaultValue={links.github || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Youtube</ControlLabel>
              <FormControl
                id="customer-youtube"
                defaultValue={links.youtube || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Website</ControlLabel>
              <FormControl
                id="customer-website"
                defaultValue={links.website || ''}
              />
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
