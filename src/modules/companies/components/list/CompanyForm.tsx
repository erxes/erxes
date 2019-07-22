import AvatarUpload from 'modules/common/components/AvatarUpload';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModifiableSelect from 'modules/common/components/ModifiableSelect';
import {
  ColumnTitle,
  FormColumn,
  FormWrapper,
  ModalFooter
} from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import {
  leadStatusChoices,
  lifecycleStateChoices
} from 'modules/customers/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import validator from 'validator';
import { IUser } from '../../../auth/types';
import {
  COMPANY_BUSINESS_TYPES,
  COMPANY_INDUSTRY_TYPES
} from '../../constants';
import { ICompany, ICompanyDoc, ICompanyLinks } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  company: ICompany;
  closeModal: () => void;
};

type State = {
  parentCompanyId?: string;
  ownerId?: string;
  companies?: ICompany[];
  doNotDisturb?: string;
  users?: IUser[];
  avatar?: string;

  names?: string[];
  emails?: string[];
  phones?: string[];
  primaryName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
};

class CompanyForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { company = {} } = props;
    const companies: ICompany[] = [];

    if (company.parentCompany) {
      companies.push(company.parentCompany);
    }

    this.state = {
      parentCompanyId: company.parentCompanyId || '',
      ownerId: company.ownerId || '',
      companies,
      doNotDisturb: company.doNotDisturb || 'No',
      users: [],
      avatar: company.avatar
    };
  }

  generateDoc = (
    values: { _id: string; size?: number } & ICompanyDoc & ICompanyLinks
  ) => {
    const { company } = this.props;

    const finalValues = values;

    if (company) {
      finalValues._id = company._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
      size: Number(finalValues.size),
      industry: finalValues.industry,
      leadStatus: finalValues.leadStatus,
      lifecycleState: finalValues.lifecycleState,
      businessType: finalValues.businessType,
      description: finalValues.description,
      links: {
        linkedIn: finalValues.linkedIn,
        twitter: finalValues.twitter,
        facebook: finalValues.facebook,
        github: finalValues.github,
        youtube: finalValues.youtube,
        website: finalValues.website
      }
    };
  };

  onAvatarUpload = (url: string) => {
    this.setState({ avatar: url });
  };

  generateConstantParams(constants) {
    return constants.map(constant => ({
      value: constant,
      label: constant
    }));
  }

  handleSelect = <T extends keyof State>(selectedOption: string, name: T) => {
    this.setState({
      [name]: selectedOption
    } as Pick<State, keyof State>);
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onChange = (
    optionsName: string,
    optionName: string,
    { options, selectedOption }: { options: string[]; selectedOption: string }
  ) => {
    this.setState({ [optionsName]: options, [optionName]: selectedOption });
  };

  renderContent = (formProps: IFormProps) => {
    const company = this.props.company || ({} as ICompany);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const {
      links = {},
      primaryName,
      names,
      primaryPhone,
      phones,
      primaryEmail,
      emails
    } = company;

    const { parentCompanyId, ownerId } = this.state;

    const onSelectOwner = value => {
      return this.handleSelect(value, 'ownerId');
    };

    const onSelectParentCompany = value => {
      return this.handleSelect(value, 'parentCompanyId');
    };

    return (
      <>
        <AvatarUpload
          avatar={company.avatar}
          onAvatarUpload={this.onAvatarUpload}
          defaultAvatar="/images/company.png"
        />
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <ModifiableSelect
                value={primaryName}
                options={names || []}
                placeholder="Primary name"
                buttonText="Add name"
                adding={true}
                required={true}
                onChange={this.onChange.bind(this, 'names', 'primaryName')}
              />
            </FormGroup>

            {this.renderFormGroup('Industry', {
              ...formProps,
              name: 'industry',
              componentClass: 'select',
              defaultValue: company.industry || '',
              options: this.generateConstantParams(COMPANY_INDUSTRY_TYPES)
            })}

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <SelectTeamMembers
                label="Choose an owner"
                name="ownerId"
                value={ownerId}
                onSelect={onSelectOwner}
                multi={false}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <ModifiableSelect
                value={primaryEmail}
                options={emails || []}
                placeholder="Primary Email"
                buttonText="Add email"
                onChange={this.onChange.bind(this, 'emails', 'primaryEmail')}
                checkFormat={validator.isEmail}
              />
            </FormGroup>

            {this.renderFormGroup('Lead Status', {
              ...formProps,
              name: 'leadStatus',
              componentClass: 'select',
              defaultValue: company.leadStatus || '',
              options: leadStatusChoices(__)
            })}

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                {...formProps}
                max={140}
                name="description"
                componentClass="textarea"
                defaultValue={company.description || ''}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Parent Company</ControlLabel>
              <SelectCompanies
                label="Choose parent company"
                name="parentCompanyId"
                value={parentCompanyId}
                onSelect={onSelectParentCompany}
                multi={false}
              />
            </FormGroup>
            {this.renderFormGroup('Business Type', {
              ...formProps,
              name: 'businessType',
              componentClass: 'select',
              defaultValue: company.businessType || '',
              options: this.generateConstantParams(COMPANY_BUSINESS_TYPES)
            })}
            {this.renderFormGroup('Size', {
              ...formProps,
              name: 'size',
              type: 'number',
              defaultValue: company.size || 0
            })}

            <FormGroup>
              <ControlLabel>Phone</ControlLabel>
              <ModifiableSelect
                value={primaryPhone}
                options={phones || []}
                placeholder="Primary phone"
                buttonText="Add phone"
                onChange={this.onChange.bind(this, 'phones', 'primaryPhone')}
                checkFormat={validator.isMobilePhone}
              />
            </FormGroup>

            {this.renderFormGroup('Lifecycle State', {
              ...formProps,
              name: 'lifecycleState',
              componentClass: 'select',
              defaultValue: company.lifecycleState || '',
              options: lifecycleStateChoices(__)
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
              ...formProps,
              name: 'linkedIn',
              defaultValue: links.linkedIn || '',
              type: 'url'
            })}

            {this.renderFormGroup('Twitter', {
              ...formProps,
              name: 'twitter',
              defaultValue: links.twitter || '',
              type: 'url'
            })}

            {this.renderFormGroup('Facebook', {
              ...formProps,
              name: 'facebook',
              defaultValue: links.facebook || '',
              type: 'url'
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Github', {
              ...formProps,
              name: 'github',
              defaultValue: links.github || '',
              type: 'url'
            })}

            {this.renderFormGroup('Youtube', {
              ...formProps,
              name: 'youtube',
              defaultValue: links.youtube || '',
              type: 'url'
            })}

            {this.renderFormGroup('Website', {
              ...formProps,
              name: 'website',
              defaultValue: links.website || '',
              type: 'url'
            })}
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'company',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: this.props.company
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default CompanyForm;
