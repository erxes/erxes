import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  Button,
  Form,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import {
  ModalFooter,
  FormWrapper,
  FormColumn,
  ColumnTitle
} from 'modules/common/styles/main';
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
    this.handleUserSearch = this.handleUserSearch.bind(this);
  }

  action(doc) {
    this.props.action({
      doc: {
        ...doc,
        doNotDisturb: this.state.doNotDisturb,
        hasAuthority: this.state.hasAuthority,
        ownerId: this.state.ownerId,
        links: {
          linkedIn: doc.linkedIn,
          twitter: doc.twitter,
          facebook: doc.facebook,
          github: doc.gitub,
          youtube: doc.youtube,
          website: doc.website
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

  handleUserSearch(value) {
    searchUser(value, users => this.setState({ users }));
  }

  getVisitorInfo(customer, key) {
    return customer.visitorContactInfo && customer.visitorContactInfo[key];
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
      <Form onSubmit={e => this.action(e)}>
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('First Name', {
              value: customer.firstName || '',
              autoFocus: true,
              name: 'firstName',
              validations: 'isValue',
              validationError: 'Please enter a first name'
            })}

            {this.renderFormGroup('Email', {
              type: 'email',
              value:
                customer.email || this.getVisitorInfo(customer, 'email') || '',
              name: 'email',
              validations: 'isEmail',
              validationError: 'Not a valid email format'
            })}

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <Select
                placeholder={__('Search')}
                onFocus={() => users.length < 1 && this.handleUserSearch('')}
                onInputChange={this.handleUserSearch}
                onChange={selectedOption => {
                  this.setState({
                    ownerId: selectedOption ? selectedOption.value : null
                  });
                }}
                value={this.state.ownerId}
                options={this.generateUserParams(users)}
              />
            </FormGroup>

            {this.renderFormGroup('Department', {
              value: customer.department || '',
              name: 'department',
              validations: 'isValue',
              validationError: 'Please enter a department'
            })}

            {this.renderFormGroup('Lifecycle State', {
              componentClass: 'select',
              name: 'lifecycleState',
              validations: {},
              value: customer.lifecycleState || '',
              options: this.generateConstantParams(
                CUSTOMER_LIFECYCLE_STATE_TYPES
              )
            })}

            {this.renderFormGroup('Description', {
              value: customer.description || '',
              name: 'description',
              validations: 'isValue',
              validationError: 'Please enter a description'
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Last Name', {
              value: customer.lastName || '',
              name: 'lastName',
              validations: 'isValue',
              validationError: 'Please enter a last name'
            })}

            {this.renderFormGroup('Phone', {
              name: 'phone',
              validations: 'isValue',
              validationError: 'Please enter a phone',
              value:
                customer.phone || this.getVisitorInfo(customer, 'phone') || ''
            })}

            {this.renderFormGroup('Position', {
              name: 'position',
              validations: 'isValue',
              validationError: 'Please enter a position',
              value: customer.position || ''
            })}

            {this.renderFormGroup('Lead Status', {
              componentClass: 'select',
              name: 'leadStatus',
              validations: {},
              value: customer.leadStatus || '',
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
              name: 'linkedin',
              validations: 'isUrl',
              validationError: 'Not a valid URL format',
              value: links.linkedIn || ''
            })}

            {this.renderFormGroup('Twitter', {
              name: 'twitter',
              validations: 'isUrl',
              validationError: 'Not a valid URL format',
              value: links.twitter || ''
            })}

            {this.renderFormGroup('Facebook', {
              name: 'facebook',
              validations: 'isUrl',
              validationError: 'Not a valid URL format',
              value: links.facebook || ''
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Github', {
              name: 'github',
              validations: 'isUrl',
              validationError: 'Not a valid URL format',
              value: links.github || ''
            })}

            {this.renderFormGroup('Youtube', {
              name: 'youtube',
              validations: 'isUrl',
              validationError: 'Not a valid URL format',
              value: links.youtube || ''
            })}

            {this.renderFormGroup('Website', {
              name: 'website',
              validations: 'isUrl',
              validationError: 'Not a valid URL format',
              value: links.website || ''
            })}
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={() => closeModal()}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </Form>
    );
  }
}

CustomerForm.propTypes = propTypes;
CustomerForm.contextTypes = contextTypes;

export default CustomerForm;
