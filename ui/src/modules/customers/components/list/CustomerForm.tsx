import { IUser, IUserLinks } from 'modules/auth/types';
import AvatarUpload from 'modules/common/components/AvatarUpload';
import Button from 'modules/common/components/Button';
import CollapseContent from 'modules/common/components/CollapseContent';
import FormControl from 'modules/common/components/form/Control';
import DateControl from 'modules/common/components/form/DateControl';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModifiableSelect from 'modules/common/components/ModifiableSelect';
import {
  DateContainer,
  FormColumn,
  FormWrapper,
  ModalFooter,
  ScrollWrapper
} from 'modules/common/styles/main';
import {
  IButtonMutateProps,
  IFormProps,
  IQueryParams
} from 'modules/common/types';
import { Alert, getConstantFromStore } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import validator from 'validator';
import { ICustomer, ICustomerDoc } from '../../types';
import { genderChoices, isValidPhone } from '../../utils';

type Props = {
  currentUser: IUser;
  customer?: ICustomer;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  queryParams: IQueryParams;
  changeRedirectType?: (type: string) => void;
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
  birthDate: string;
  primaryEmail?: string;
};

class CustomerForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const customer = props.customer || ({} as ICustomer);
    const userId = props.currentUser ? props.currentUser._id : '';

    this.state = {
      ownerId: customer.ownerId || userId,
      doNotDisturb: customer.doNotDisturb || 'No',
      hasAuthority: customer.hasAuthority || 'No',
      users: [],
      birthDate: customer.birthDate,
      avatar: customer.avatar
    };
  }

  generateDoc = (values: { _id: string } & ICustomerDoc & IUserLinks) => {
    const { customer } = this.props;
    const finalValues = values;

    if (customer) {
      finalValues._id = customer._id;
    }

    const links = {};

    getConstantFromStore('social_links').forEach(link => {
      links[link.value] = finalValues[link.value];
    });

    return {
      _id: finalValues._id,
      ...this.state,
      firstName: finalValues.firstName,
      lastName: finalValues.lastName,
      sex: Number(finalValues.sex),
      position: finalValues.position,
      department: finalValues.department,
      leadStatus: finalValues.leadStatus,
      description: finalValues.description,
      code: finalValues.code,
      links
    };
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
        <ControlLabel required={props.required && true}>{label}</ControlLabel>
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

  onDateChange = birthDate => {
    const currentDate = new Date();
    if (currentDate > birthDate) {
      this.setState({ birthDate });
    } else {
      Alert.error('Please enter a valid "Date".');
    }
  };

  saveAndRedirect = (type: string) => {
    const { changeRedirectType } = this.props;

    if (changeRedirectType) {
      changeRedirectType(type);
    }
  };

  hasEmail = () => {
    const customer = this.props.customer || ({} as ICustomer);

    const { emails = [] } = customer;

    return this.getVisitorInfo(customer, 'email') || emails.length > 0;
  };

  renderLink(formProps, link) {
    const { customer } = this.props;
    const links = (customer ? customer.links : {}) || {};

    return this.renderFormGroup(link.label, {
      ...formProps,
      name: link.value,
      defaultValue: links[link.value] || '',
      type: 'url'
    });
  }

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted, resetSubmit } = formProps;

    const customer = this.props.customer || ({} as ICustomer);
    const { primaryEmail, primaryPhone } = customer;

    return (
      <>
        <ScrollWrapper>
          <CollapseContent
            title={__('General information')}
            compact={true}
            open={true}
          >
            <FormWrapper>
              <FormColumn>
                <AvatarUpload
                  avatar={customer.avatar}
                  onAvatarUpload={this.onAvatarUpload}
                />
              </FormColumn>
              <FormColumn>
                {this.renderFormGroup('Code', {
                  ...formProps,
                  name: 'code',
                  defaultValue: customer.code || ''
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
              </FormColumn>
            </FormWrapper>
            <FormWrapper>
              <FormColumn>
                {this.renderFormGroup('First Name', {
                  ...formProps,
                  defaultValue: customer.firstName || '',
                  autoFocus: true,
                  required: true,
                  name: 'firstName'
                })}

                <FormGroup>
                  <ControlLabel required={true}>Email</ControlLabel>
                  <ModifiableSelect
                    value={primaryEmail}
                    type="email"
                    options={this.getEmailsOptions(customer)}
                    name="Email"
                    onChange={this.onEmailChange}
                    required={true}
                    checkFormat={validator.isEmail}
                    adding={!this.hasEmail()}
                  />
                </FormGroup>

                {this.renderFormGroup('Pronoun', {
                  ...formProps,
                  name: 'sex',
                  componentClass: 'select',
                  defaultValue: customer.sex || 0,
                  options: genderChoices(__)
                })}

                {this.renderFormGroup('Department', {
                  ...formProps,
                  name: 'department',
                  defaultValue: customer.department || ''
                })}

                <FormGroup>
                  <ControlLabel>Description</ControlLabel>
                  <FormControl
                    {...formProps}
                    max={140}
                    name="description"
                    componentClass="textarea"
                    defaultValue={customer.description || ''}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                {this.renderFormGroup('Last Name', {
                  ...formProps,
                  name: 'lastName',
                  defaultValue: customer.lastName || ''
                })}

                <FormGroup>
                  <ControlLabel>Phone</ControlLabel>
                  <ModifiableSelect
                    value={primaryPhone}
                    options={this.getPhonesOptions(customer)}
                    name="Phone"
                    onChange={this.onPhoneChange}
                    checkFormat={isValidPhone}
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel required={false}>Birthday</ControlLabel>
                  <DateContainer>
                    <DateControl
                      {...formProps}
                      required={false}
                      name="birthDate"
                      placeholder={'Birthday'}
                      value={this.state.birthDate}
                      onChange={this.onDateChange}
                    />
                  </DateContainer>
                </FormGroup>

                {this.renderFormGroup('Position', {
                  ...formProps,
                  name: 'position',
                  defaultValue: customer.position || ''
                })}

                {this.renderFormGroup('Has Authority', {
                  ...formProps,
                  name: 'hasAuthority',
                  componentClass: 'radio',
                  options: [
                    {
                      childNode: 'Yes',
                      value: 'Yes',
                      checked: this.state.hasAuthority === 'Yes',
                      onChange: e =>
                        this.setState({ hasAuthority: e.target.value })
                    },
                    {
                      childNode: 'No',
                      value: 'No',
                      checked: this.state.hasAuthority === 'No',
                      onChange: e =>
                        this.setState({ hasAuthority: e.target.value })
                    }
                  ]
                })}

                {this.renderFormGroup('Do not disturb', {
                  ...formProps,
                  name: 'doNotDisturb',
                  componentClass: 'radio',
                  options: [
                    {
                      childNode: 'Yes',
                      value: 'Yes',
                      checked: this.state.doNotDisturb === 'Yes',
                      onChange: e =>
                        this.setState({ doNotDisturb: e.target.value })
                    },
                    {
                      childNode: 'No',
                      value: 'No',
                      checked: this.state.doNotDisturb === 'No',
                      onChange: e =>
                        this.setState({ doNotDisturb: e.target.value })
                    }
                  ]
                })}
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
          <CollapseContent title={__('Links')} compact={true}>
            <FormWrapper>
              <FormColumn>
                {getConstantFromStore('social_links').map(link =>
                  this.renderLink(formProps, link)
                )}
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            uppercase={false}
            onClick={closeModal}
            icon="times-circle"
          >
            Close
          </Button>

          {renderButton({
            name: customer.state || 'customer',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.customer,
            resetSubmit
          })}

          {!this.props.customer && (
            <>
              <Button
                btnStyle="primary"
                type="submit"
                uppercase={false}
                icon="user-square"
                onClick={this.saveAndRedirect.bind(this, 'detail')}
                disabled={isSubmitted}
              >
                Save & View
              </Button>
              <Button
                type="submit"
                uppercase={false}
                onClick={this.saveAndRedirect.bind(this, 'new')}
                disabled={isSubmitted}
                icon="user-plus"
              >
                Save & New
              </Button>
            </>
          )}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default CustomerForm;
