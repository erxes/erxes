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
import { __, searchCompany, searchUser } from 'modules/common/utils';
import {
  leadStatusChoices,
  lifecycleStateChoices
} from 'modules/customers/utils';
import * as React from 'react';
import Select from 'react-select-plus';
import { IUser } from '../../../auth/types';
import {
  COMPANY_BUSINESS_TYPES,
  COMPANY_INDUSTRY_TYPES
} from '../../constants';
import { ICompany, ICompanyDoc } from '../../types';

type Props = {
  action: (params: { doc: ICompanyDoc }) => void,
  company: ICompany,
  closeModal: () => void,
};

type State = {
  parentCompanyId: string,
  ownerId: string,
  companies: ICompany[],
  doNotDisturb: string,
  users: IUser[]
  avatar: string,
  names: string[],
  primaryName: string,
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
      avatar: company.avatar,
      names: [],
      primaryName: '',
    };

    this.action = this.action.bind(this);
    this.renderFormGroup = this.renderFormGroup.bind(this);
    this.handleCompanySearch = this.handleCompanySearch.bind(this);
    this.handleUserSearch = this.handleUserSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onAvatarUpload = this.onAvatarUpload.bind(this);
  }

  componentDidMount() {
    const company = this.props.company || {} as ICompany;

    if (company.owner && company.owner.details) {
      this.handleUserSearch(company.owner.details.fullName)
    };
  }

  getInputElementValue(id) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  action(e) {
    const { names, primaryName, avatar } = this.state;
    e.preventDefault();

    this.props.action({
      doc: {
        names,
        primaryName,
        avatar,
        size: parseInt(this.getInputElementValue('company-size'), 10),
        industry: this.getInputElementValue('company-industry'),
        parentCompanyId: this.state.parentCompanyId,
        email: this.getInputElementValue('company-email'),
        ownerId: this.state.ownerId,
        phone: this.getInputElementValue('company-phone'),
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
          website: this.getInputElementValue('company-website'),
        }
      }
    });

    this.props.closeModal();
  }

  onAvatarUpload(url) {
    this.setState({ avatar: url });
  }

  generateCompanyParams(companies) {
    return companies.map(company => ({
      value: company._id,
      label: company.primaryName || ''
    }));
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

  handleSelect(selectedOption, name) {
    this.setState({ [name]: selectedOption ? selectedOption.value : null });
  }

  /*
   * Used filterOptions={(options) => options} in component to solve
   * `react-select leaving out a particular option` issue
   */
  handleCompanySearch(value) {
    if (value) {
      searchCompany(value, companies => this.setState({ companies }));
    }
  }

  handleUserSearch(value) {
    if (value) {
      searchUser(value, users => this.setState({ users }));
    }
  }

  renderFormGroup(label, props) {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  }

  onChange({ options, selectedOption }) {
    this.setState({ names: options, primaryName: selectedOption });
  }

  render() {
    const company = this.props.company || {} as ICompany;

    const { links = {}, primaryName, names } = company;
    const { parentCompanyId, ownerId, companies, users } = this.state;

    return (
      <form onSubmit={e => this.action(e)}>
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
                onChange={obj => this.onChange(obj)}
              />
            </FormGroup>

            {this.renderFormGroup('Industry', {
              id: 'company-industry',
              componentClass: 'select',
              defaultValue: company.industry || '',
              options: this.generateConstantParams(COMPANY_INDUSTRY_TYPES)
            })}
            <FormGroup>
              <ControlLabel>Parent Company</ControlLabel>
              <Select
                placeholder={__('Search')}
                onFocus={() => this.handleCompanySearch(' ')}
                onInputChange={this.handleCompanySearch}
                filterOptions={options => options}
                onChange={option =>
                  this.handleSelect(option, 'parentCompanyId')
                }
                value={parentCompanyId}
                options={this.generateCompanyParams(companies)}
              />
            </FormGroup>
            {this.renderFormGroup('Lead Status', {
              id: 'company-leadStatus',
              componentClass: 'select',
              defaultValue: company.leadStatus || '',
              options: leadStatusChoices(__)
            })}
            {this.renderFormGroup('Business Type', {
              id: 'company-businessType',
              componentClass: 'select',
              defaultValue: company.businessType || '',
              options: this.generateConstantParams(COMPANY_BUSINESS_TYPES)
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Email', {
              id: 'company-email',
              defaultValue: company.email || ''
            })}
            {this.renderFormGroup('Size', {
              id: 'company-size',
              defaultValue: company.size || 0
            })}
            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <Select
                placeholder="Search"
                onFocus={() => this.handleUserSearch(' ')}
                onInputChange={this.handleUserSearch}
                filterOptions={options => options}
                onChange={option => this.handleSelect(option, 'ownerId')}
                value={ownerId}
                options={this.generateUserParams(users)}
              />
            </FormGroup>
            {this.renderFormGroup('Phone', {
              id: 'company-phone',
              defaultValue: company.phone || ''
            })}
            {this.renderFormGroup('Lifecycle State', {
              id: 'company-lifecycleState',
              componentClass: 'select',
              defaultValue: company.lifecycleState || '',
              options: lifecycleStateChoices(__)
            })}
            {this.renderFormGroup('Description', {
              id: 'company-description',
              defaultValue: company.description || ''
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
          <Button
            btnStyle="simple"
            onClick={() => {
              this.props.closeModal();
            }}
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

export default CompanyForm;
