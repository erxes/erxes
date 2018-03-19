import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';
import {
  CUSTOMER_LEAD_STATUS_TYPES,
  CUSTOMER_LIFECYCLE_STATE_TYPES
} from '../../constants';
import { FormWrapper, FormColumn, ColumnTitle } from '../../styles';

const propTypes = {
  customer: PropTypes.object,
  action: PropTypes.func.isRequired,
  users: PropTypes.array
};

const contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func.isRequired
};

class CustomerForm extends React.Component {
  constructor(props) {
    super(props);
    const { customer = {} } = props;

    this.state = {
      ownerId: customer.ownerId || '',
      doNotDisturb: customer.doNotDisturb || 'No',
      hasAuthority: customer.hasAuthority || 'No'
    };

    this.action = this.action.bind(this);
  }

  action(e) {
    e.preventDefault();

    const firstName = document.getElementById('customer-firstname');
    const lastName = document.getElementById('customer-lastname');
    const email = document.getElementById('customer-email');
    const phone = document.getElementById('customer-phone');
    const position = document.getElementById('customer-position');
    const department = document.getElementById('customer-department');
    const leadStatus = document.getElementById('customer-leadStatus');
    const lifecycleState = document.getElementById('customer-lifecycleState');
    const description = document.getElementById('customer-description');
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
        ownerId: this.state.ownerId,
        phone: phone.value,
        position: position.value,
        department: department.value,
        leadStatus: leadStatus.value,
        lifecycleState: lifecycleState.value,
        hasAuthority: this.state.hasAuthority,
        description: description.value,
        doNotDisturb: this.state.doNotDisturb,

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

  generateUserParams(users) {
    return users.map(user => ({
      value: user._id,
      label: user.details.fullName || ''
    }));
  }

  render() {
    const { __, closeModal } = this.context;
    const { customer = {}, users } = this.props;
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
              <Select
                placeholder="Search..."
                onChange={selectedOption => {
                  this.setState({ ownerId: selectedOption.value });
                }}
                value={this.state.ownerId}
                options={this.generateUserParams(users)}
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
                {CUSTOMER_LEAD_STATUS_TYPES.ALL.map((type, index) => {
                  return <option key={index}>{type}</option>;
                })}
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
                {CUSTOMER_LIFECYCLE_STATE_TYPES.ALL.map((type, index) => {
                  return <option key={index}>{type}</option>;
                })}
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Has Authority</ControlLabel>
              <FormControl
                componentClass="radio"
                value="Yes"
                onChange={e => {
                  this.setState({ hasAuthority: e.target.value });
                }}
                checked={this.state.hasAuthority === 'Yes'}
              >
                Yes
              </FormControl>
              <FormControl
                componentClass="radio"
                value="No"
                onChange={e => {
                  this.setState({ hasAuthority: e.target.value });
                }}
                checked={this.state.hasAuthority === 'No'}
              >
                No
              </FormControl>
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
                componentClass="radio"
                value="Yes"
                onChange={e => {
                  this.setState({ doNotDisturb: e.target.value });
                }}
                checked={this.state.doNotDisturb === 'Yes'}
              >
                Yes
              </FormControl>
              <FormControl
                componentClass="radio"
                value="No"
                onChange={e => {
                  this.setState({ doNotDisturb: e.target.value });
                }}
                checked={this.state.doNotDisturb === 'No'}
              >
                No
              </FormControl>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <ColumnTitle>{__('Links')}</ColumnTitle>
            <FormGroup>
              <ControlLabel>LinkedIn</ControlLabel>
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
