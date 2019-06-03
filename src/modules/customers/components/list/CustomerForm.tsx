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
import { IQueryParams } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { SelectTeamMembers } from 'modules/settings/team/containers';
import * as React from 'react';
import { ICustomer, ICustomerDoc } from '../../types';
import {
  leadStatusChoices,
  lifecycleStateChoices,
  regexEmail,
  regexPhone
} from '../../utils';

type Props = {
  customer?: ICustomer;
  action: (params: { doc: ICustomerDoc }) => void;
  closeModal: () => void;
  queryParams: IQueryParams;
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
      ownerId: customer.ownerId || '',
      doNotDisturb: customer.doNotDisturb || 'No',
      hasAuthority: customer.hasAuthority || 'No',
      users: [],
      avatar: customer.avatar
    };
  }

  getInputElementValue(id) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  onSubmit = e => {
    const { phones, emails, primaryPhone, primaryEmail, avatar } = this.state;

    e.preventDefault();

    this.props.action({
      doc: {
        phones,
        emails,
        primaryPhone,
        primaryEmail,
        avatar,
        ownerId: this.state.ownerId,
        hasAuthority: this.state.hasAuthority,
        doNotDisturb: this.state.doNotDisturb,
        firstName: this.getInputElementValue('customer-firstname'),
        lastName: this.getInputElementValue('customer-lastname'),
        position: this.getInputElementValue('customer-position'),
        department: this.getInputElementValue('customer-department'),
        leadStatus: this.getInputElementValue('customer-leadStatus'),
        lifecycleState: this.getInputElementValue('customer-lifecycleState'),
        description: this.getInputElementValue('customer-description'),

        links: {
          linkedIn: this.getInputElementValue('customer-linkedin'),
          twitter: this.getInputElementValue('customer-twitter'),
          facebook: this.getInputElementValue('customer-facebook'),
          github: this.getInputElementValue('customer-github'),
          youtube: this.getInputElementValue('customer-youtube'),
          website: this.getInputElementValue('customer-website')
        }
      }
    });

    this.props.closeModal();
  };

  onAvatarUpload = url => {
    this.setState({ avatar: url });
  };

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

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onEmailChange = ({ options, selectedOption }) => {
    this.setState({ emails: options, primaryEmail: selectedOption });
  };

  onPhoneChange = ({ options, selectedOption }) => {
    this.setState({ phones: options, primaryPhone: selectedOption });
  };

  onOwnerChange = ownerId => {
    this.setState({ ownerId });
  };

  render() {
    const { closeModal } = this.props;

    const customer = this.props.customer || ({} as ICustomer);
    const { links = {}, primaryEmail, primaryPhone } = customer;

    return (
      <form onSubmit={this.onSubmit}>
        <AvatarUpload
          avatar={customer.avatar}
          onAvatarUpload={this.onAvatarUpload}
        />
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('First Name', {
              defaultValue: customer.firstName || '',
              autoFocus: true,
              required: true,
              id: 'customer-firstname'
            })}

            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <ModifiableSelect
                value={primaryEmail}
                options={this.getEmailsOptions(customer)}
                placeholder="Choose primary email"
                buttonText="Add Email"
                onChange={this.onEmailChange}
                regex={regexEmail}
              />
            </FormGroup>

            {this.renderFormGroup('Position', {
              id: 'customer-position',
              defaultValue: customer.position || ''
            })}

            {this.renderFormGroup('Lead Status', {
              id: 'customer-leadStatus',
              componentClass: 'select',
              defaultValue: customer.leadStatus || '',
              options: leadStatusChoices(__)
            })}

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <SelectTeamMembers
                label="Choose an owner"
                name="ownerId"
                value={this.state.ownerId}
                onSelect={this.onOwnerChange}
                multi={false}
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
              id: 'customer-lastname',
              defaultValue: customer.lastName || ''
            })}

            <FormGroup>
              <ControlLabel>Phone</ControlLabel>
              <ModifiableSelect
                value={primaryPhone}
                options={this.getPhonesOptions(customer)}
                placeholder="Choose primary phone"
                buttonText="Add Phone"
                onChange={this.onPhoneChange}
                regex={regexPhone}
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
              options: lifecycleStateChoices(__)
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
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
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
