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
import { __ } from 'modules/common/utils';
import { SelectCompanies } from 'modules/companies/containers';
import { regexEmail, regexPhone } from 'modules/customers/utils';
import {
  leadStatusChoices,
  lifecycleStateChoices
} from 'modules/customers/utils';
import { SelectTeamMembers } from 'modules/settings/team/containers';
import * as React from 'react';
import { IUser } from '../../../auth/types';
import {
  COMPANY_BUSINESS_TYPES,
  COMPANY_INDUSTRY_TYPES
} from '../../constants';
import { ICompany, ICompanyDoc } from '../../types';

type Props = {
  action: (params: { doc: ICompanyDoc }) => void;
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

  getInputElementValue(id) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  action = e => {
    const {
      names,
      primaryName,
      avatar,
      phones,
      primaryPhone,
      emails,
      primaryEmail
    } = this.state;
    e.preventDefault();

    this.props.action({
      doc: {
        names,
        primaryName,
        avatar,
        size: parseInt(this.getInputElementValue('company-size'), 10),
        industry: this.getInputElementValue('company-industry'),
        parentCompanyId: this.state.parentCompanyId,
        emails,
        primaryEmail,
        phones,
        primaryPhone,
        ownerId: this.state.ownerId,
        leadStatus: this.getInputElementValue('company-leadStatus'),
        lifecycleState: this.getInputElementValue('company-lifecycleState'),
        businessType: this.getInputElementValue('company-businessType'),
        description: this.getInputElementValue('company-description'),
        doNotDisturb: this.state.doNotDisturb,
        links: {
          linkedIn: this.getInputElementValue('company-linkedIn'),
          twitter: this.getInputElementValue('company-twitter'),
          facebook: this.getInputElementValue('company-facebook'),
          github: this.getInputElementValue('company-github'),
          youtube: this.getInputElementValue('company-youtube'),
          website: this.getInputElementValue('company-website')
        }
      }
    });

    this.props.closeModal();
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

  render() {
    const company = this.props.company || ({} as ICompany);
    const { closeModal } = this.props;

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
      <form onSubmit={this.action}>
        <AvatarUpload
          avatar={company.avatar}
          onAvatarUpload={this.onAvatarUpload}
          defaultAvatar="/images/company.png"
        />
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <ModifiableSelect
                value={primaryName}
                options={names || []}
                placeholder="Primary name"
                buttonText="Add name"
                adding={true}
                onChange={this.onChange.bind(this, 'names', 'primaryName')}
              />
            </FormGroup>

            {this.renderFormGroup('Industry', {
              id: 'company-industry',
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
                regex={regexEmail}
              />
            </FormGroup>

            {this.renderFormGroup('Lead Status', {
              id: 'company-leadStatus',
              componentClass: 'select',
              defaultValue: company.leadStatus || '',
              options: leadStatusChoices(__)
            })}

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                type="text"
                max={140}
                id="company-description"
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
              id: 'company-businessType',
              componentClass: 'select',
              defaultValue: company.businessType || '',
              options: this.generateConstantParams(COMPANY_BUSINESS_TYPES)
            })}
            {this.renderFormGroup('Size', {
              id: 'company-size',
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
                regex={regexPhone}
              />
            </FormGroup>

            {this.renderFormGroup('Lifecycle State', {
              id: 'company-lifecycleState',
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
              id: 'company-linkedIn',
              defaultValue: links.linkedIn || ''
            })}

            {this.renderFormGroup('Twitter', {
              id: 'company-twitter',
              defaultValue: links.twitter || ''
            })}

            {this.renderFormGroup('Facebook', {
              id: 'company-facebook',
              defaultValue: links.facebook || ''
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Github', {
              id: 'company-github',
              defaultValue: links.github || ''
            })}

            {this.renderFormGroup('Youtube', {
              id: 'company-youtube',
              defaultValue: links.youtube || ''
            })}

            {this.renderFormGroup('Website', {
              id: 'company-website',
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

export default CompanyForm;
