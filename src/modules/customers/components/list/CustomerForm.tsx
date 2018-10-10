import { IUser } from 'modules/auth/types';
import {
  AvatarUpload,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModifiableSelect
} from 'modules/common/components';
import {
  ColumnTitle,
  FormColumn,
  FormWrapper,
  ModalFooter
} from 'modules/common/styles/main';
import { __, searchUser } from 'modules/common/utils';
import * as React from 'react';
import Select from 'react-select-plus';
import { ICustomer, ICustomerDoc } from '../../types';
import { leadStatusChoices, lifecycleStateChoices } from '../../utils';

type Props = {
  customer?: ICustomer;
  action: (params: { doc: ICustomerDoc }) => void;
  closeModal: () => void;
};

type State = {
  ownerId: string;
  doNotDisturb: string;
  hasAuthority: string;
  users: IUser[];
  avatar: string;
  phones?: string[];
  emails?: string[];
  primaryPhone?: string;
  primaryEmail?: string;
};

class CustomerForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const customer = props.customer || ({} as ICustomer);

    this.state = {
      avatar: customer.avatar,
      doNotDisturb: customer.doNotDisturb || 'No',
      hasAuthority: customer.hasAuthority || 'No',
      ownerId: customer.ownerId || '',
      users: []
    };

    this.renderFormGroup = this.renderFormGroup.bind(this);
    this.action = this.action.bind(this);
    this.handleUserSearch = this.handleUserSearch.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onPhoneChange = this.onPhoneChange.bind(this);
    this.onAvatarUpload = this.onAvatarUpload.bind(this);
  }

  componentDidMount() {
    const { customer } = this.props;

    if (customer && customer.owner && customer.owner.details) {
      this.handleUserSearch(customer.owner.details.fullName);
    }
  }

  getInputElementValue(id) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  action(e) {
    const { phones, emails, primaryPhone, primaryEmail, avatar } = this.state;

    e.preventDefault();

    this.props.action({
      doc: {
        avatar,
        department: this.getInputElementValue('customer-department'),
        description: this.getInputElementValue('customer-description'),
        doNotDisturb: this.state.doNotDisturb,
        emails,
        firstName: this.getInputElementValue('customer-firstname'),
        hasAuthority: this.state.hasAuthority,
        lastName: this.getInputElementValue('customer-lastname'),
        leadStatus: this.getInputElementValue('customer-leadStatus'),
        lifecycleState: this.getInputElementValue('customer-lifecycleState'),
        ownerId: this.state.ownerId,
        phones,
        position: this.getInputElementValue('customer-position'),
        primaryEmail,
        primaryPhone,

        links: {
          facebook: this.getInputElementValue('customer-facebook'),
          github: this.getInputElementValue('customer-github'),
          linkedIn: this.getInputElementValue('customer-linkedin'),
          twitter: this.getInputElementValue('customer-twitter'),
          website: this.getInputElementValue('customer-website'),
          youtube: this.getInputElementValue('customer-youtube')
        }
      }
    });

    this.props.closeModal();
  }

  onAvatarUpload(url) {
    this.setState({ avatar: url });
  }

  generateUserParams(users) {
    return users.map(user => ({
      label: user.details.fullName || '',
      value: user._id
    }));
  }

  generateConstantParams(constants) {
    return constants.map(constant => ({
      label: constant,
      value: constant
    }));
  }

  handleUserSearch(value) {
    if (value) {
      searchUser(value, users => this.setState({ users }));
    }
  }

  getVisitorInfo(customer, key) {
    return customer.visitorContactInfo && customer.visitorContactInfo[key];
  }

  getEmailsOptions(customer) {
    const { emails } = customer;

    if (emails && emails.length > 0) {
      return emails;
    }

    if (this.getVisitorInfo(customer, 'email')) {
      return [this.getVisitorInfo(customer, 'email')];
    }

    return [];
  }

  getPhonesOptions(customer) {
    const { phones } = customer;

    if (phones && phones.length > 0) {
      return phones;
    }

    if (this.getVisitorInfo(customer, 'phone')) {
      return [this.getVisitorInfo(customer, 'phone')];
    }

    return [];
  }

  renderFormGroup(label, props) {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  }

  onEmailChange({ options, selectedOption }) {
    this.setState({ emails: options, primaryEmail: selectedOption });
  }

  onPhoneChange({ options, selectedOption }) {
    this.setState({ phones: options, primaryPhone: selectedOption });
  }

  render() {
    const { closeModal } = this.props;
    const { users } = this.state;

    const customer = this.props.customer || ({} as ICustomer);
    const { links = {}, primaryEmail, primaryPhone } = customer;

    return (
      <form onSubmit={e => this.action(e)}>
        <AvatarUpload
          avatar={customer.avatar}
          onAvatarUpload={this.onAvatarUpload}
        />
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('First Name', {
              autoFocus: true,
              defaultValue: customer.firstName || '',
              id: 'customer-firstname',
              required: true
            })}

            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <ModifiableSelect
                value={primaryEmail}
                options={this.getEmailsOptions(customer)}
                placeholder="Primary email"
                buttonText="Add Email"
                onChange={obj => this.onEmailChange(obj)}
              />
            </FormGroup>

            {this.renderFormGroup('Position', {
              defaultValue: customer.position || '',
              id: 'customer-position'
            })}

            {this.renderFormGroup('Lead Status', {
              componentClass: 'select',
              defaultValue: customer.leadStatus || '',
              id: 'customer-leadStatus',
              options: leadStatusChoices(__)
            })}

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <Select
                placeholder={__('Search')}
                onFocus={() => this.handleUserSearch(' ')}
                onInputChange={this.handleUserSearch}
                filterOptions={options => options}
                onChange={selectedOption => {
                  this.setState({
                    ownerId: selectedOption ? selectedOption.value : null
                  });
                }}
                value={this.state.ownerId}
                options={this.generateUserParams(users)}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                type="text"
                max={140}
                id="customer-description"
                componentClass="textarea"
                defaultValue={customer.description || ''}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            {this.renderFormGroup('Last Name', {
              defaultValue: customer.lastName || '',
              id: 'customer-lastname'
            })}

            <FormGroup>
              <ControlLabel>Phone</ControlLabel>
              <ModifiableSelect
                value={primaryPhone}
                options={this.getPhonesOptions(customer)}
                placeholder="Primary phone"
                buttonText="Add Phone"
                onChange={obj => this.onPhoneChange(obj)}
              />
            </FormGroup>

            {this.renderFormGroup('Department', {
              defaultValue: customer.department || '',
              id: 'customer-department'
            })}

            {this.renderFormGroup('Lifecycle State', {
              componentClass: 'select',
              defaultValue: customer.lifecycleState || '',
              id: 'customer-lifecycleState',
              options: lifecycleStateChoices(__)
            })}

            {this.renderFormGroup('Has Authority', {
              componentClass: 'radio',
              options: [
                {
                  checked: this.state.hasAuthority === 'Yes',
                  childNode: 'Yes',
                  onChange: e =>
                    this.setState({ hasAuthority: e.target.value }),
                  value: 'Yes'
                },
                {
                  checked: this.state.hasAuthority === 'No',
                  childNode: 'No',
                  onChange: e =>
                    this.setState({ hasAuthority: e.target.value }),
                  value: 'No'
                }
              ]
            })}

            {this.renderFormGroup('Do not disturb', {
              componentClass: 'radio',
              options: [
                {
                  checked: this.state.doNotDisturb === 'Yes',
                  childNode: 'Yes',
                  onChange: e =>
                    this.setState({ doNotDisturb: e.target.value }),
                  value: 'Yes'
                },
                {
                  checked: this.state.doNotDisturb === 'No',
                  childNode: 'No',
                  onChange: e =>
                    this.setState({ doNotDisturb: e.target.value }),
                  value: 'No'
                }
              ]
            })}
          </FormColumn>
        </FormWrapper>
        <ColumnTitle>{__('Links')}</ColumnTitle>
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('LinkedIn', {
              defaultValue: links.linkedIn || '',
              id: 'customer-linkedin'
            })}

            {this.renderFormGroup('Twitter', {
              defaultValue: links.twitter || '',
              id: 'customer-twitter'
            })}

            {this.renderFormGroup('Facebook', {
              defaultValue: links.facebook || '',
              id: 'customer-facebook'
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Github', {
              defaultValue: links.github || '',
              id: 'customer-github'
            })}

            {this.renderFormGroup('Youtube', {
              defaultValue: links.youtube || '',
              id: 'customer-youtube'
            })}

            {this.renderFormGroup('Website', {
              defaultValue: links.website || '',
              id: 'customer-website'
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
      </form>
    );
  }
}

export default CustomerForm;
