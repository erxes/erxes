import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import {
  ModalFooter,
  FormWrapper,
  FormColumn,
  ColumnTitle
} from 'modules/common/styles/styles';
import { searchUser } from 'modules/common/utils';
import {
  CUSTOMER_LEAD_STATUS_TYPES,
  CUSTOMER_LIFECYCLE_STATE_TYPES
} from '../../constants';

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
    const { customer = {} } = props;

    this.state = {
      ownerId: customer.ownerId || '',
      doNotDisturb: customer.doNotDisturb || 'No',
      hasAuthority: customer.hasAuthority || 'No',
      users: []
    };

    this.renderFormGroup = this.renderFormGroup.bind(this);
    this.action = this.action.bind(this);
  }

  action(e) {
    e.preventDefault();

    this.props.action({
      doc: {
        firstName: document.getElementById('customer-firstname').value,
        lastName: document.getElementById('customer-lastname').value,
        email: document.getElementById('customer-email').value,
        ownerId: this.state.ownerId,
        phone: document.getElementById('customer-phone').value,
        position: document.getElementById('customer-position').value,
        department: document.getElementById('customer-department').value,
        leadStatus: document.getElementById('customer-leadStatus').value,
        lifecycleState: document.getElementById('customer-lifecycleState')
          .value,
        hasAuthority: this.state.hasAuthority,
        description: document.getElementById('customer-description').value,
        doNotDisturb: this.state.doNotDisturb,

        links: {
          linkedIn: document.getElementById('customer-linkedin').value,
          twitter: document.getElementById('customer-twitter').value,
          facebook: document.getElementById('customer-facebook').value,
          github: document.getElementById('customer-github').value,
          youtube: document.getElementById('customer-youtube').value,
          website: document.getElementById('customer-website').value
        }
      }
    });

    this.context.closeModal();
  }

  generateUserParams(users) {
    return users.map(user => ({
      value: user._id,
      label: user.details.fullName || ''
    }));
  }

  generateConstantParams(constants) {
    return constants.map(constant => ({
      value: constant,
      label: constant
    }));
  }

  renderFormGroup(label, props) {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  }

  render() {
    const { __, closeModal } = this.context;
    const { customer = {} } = this.props;
    const { links = {} } = customer;
    const { users } = this.state;

    return (
      <form onSubmit={e => this.action(e)}>
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('First Name', {
              defaultValue: customer.firstName || '',
              autoFocus: true,
              required: true,
              id: 'customer-firstname'
            })}

            {this.renderFormGroup('Email', {
              id: 'customer-email',
              type: 'email',
              defaultValue: customer.email || '',
              required: true
            })}

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <Select
                placeholder="Search..."
                onInputChange={value =>
                  searchUser(value, users => this.setState({ users }))
                }
                onChange={selectedOption => {
                  this.setState({ ownerId: selectedOption.value });
                }}
                value={this.state.ownerId}
                options={this.generateUserParams(users)}
              />
            </FormGroup>

            {this.renderFormGroup('Department', {
              id: 'customer-department',
              defaultValue: customer.department || ''
            })}

            {this.renderFormGroup('Lifecycle State', {
              id: 'customer-lifecycleState',
              componentClass: 'select',
              defaultValue: customer.lifecycleState || '',
              options: this.generateConstantParams(
                CUSTOMER_LIFECYCLE_STATE_TYPES
              )
            })}

            {this.renderFormGroup('Description', {
              id: 'customer-description',
              defaultValue: customer.description || ''
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Last Name', {
              id: 'customer-lastname',
              defaultValue: customer.lastName || ''
            })}

            {this.renderFormGroup('Phone', {
              id: 'customer-phone',
              defaultValue: customer.phone || ''
            })}

            {this.renderFormGroup('Position', {
              id: 'customer-position',
              defaultValue: customer.position || ''
            })}

            {this.renderFormGroup('Lead Status', {
              id: 'customer-leadStatus',
              componentClass: 'select',
              defaultValue: customer.leadStatus || '',
              options: this.generateConstantParams(CUSTOMER_LEAD_STATUS_TYPES)
            })}

            {this.renderFormGroup('Has Authority', {
              componentClass: 'radio',
              options: [
                {
                  childNode: 'Yes',
                  value: 'Yes',
                  checked: this.state.hasAuthority === 'Yes',
                  onChange: e => this.setState({ hasAuthority: e.target.value })
                },
                {
                  childNode: 'No',
                  value: 'No',
                  checked: this.state.hasAuthority === 'No',
                  onChange: e => this.setState({ hasAuthority: e.target.value })
                }
              ]
            })}

            {this.renderFormGroup('Do not disturb', {
              componentClass: 'radio',
              options: [
                {
                  childNode: 'Yes',
                  value: 'Yes',
                  checked: this.state.doNotDisturb === 'Yes',
                  onChange: e => this.setState({ doNotDisturb: e.target.value })
                },
                {
                  childNode: 'No',
                  value: 'No',
                  checked: this.state.doNotDisturb === 'No',
                  onChange: e => this.setState({ doNotDisturb: e.target.value })
                }
              ]
            })}
          </FormColumn>
        </FormWrapper>
        <ColumnTitle>{__('Links')}</ColumnTitle>
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('LinkedIn', {
              id: 'customer-linkedin',
              defaultValue: links.linkedIn || ''
            })}

            {this.renderFormGroup('Twitter', {
              id: 'customer-twitter',
              defaultValue: links.twitter || ''
            })}

            {this.renderFormGroup('Facebook', {
              id: 'customer-facebook',
              defaultValue: links.facebook || ''
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Github', {
              id: 'customer-github',
              defaultValue: links.github || ''
            })}

            {this.renderFormGroup('Youtube', {
              id: 'customer-youtube',
              defaultValue: links.youtube || ''
            })}

            {this.renderFormGroup('Website', {
              id: 'customer-website',
              defaultValue: links.website || ''
            })}
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={() => closeModal()} icon="close">
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

CustomerForm.propTypes = propTypes;
CustomerForm.contextTypes = contextTypes;

export default CustomerForm;
