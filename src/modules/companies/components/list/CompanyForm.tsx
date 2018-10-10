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
  action: (params: { doc: ICompanyDoc }) => void;
  company: ICompany;
  closeModal: () => void;
};

type State = {
  parentCompanyId: string;
  ownerId: string;
  companies: ICompany[];
  doNotDisturb: string;
  users: IUser[];
  avatar: string;
  names?: string[];
  primaryName?: string;
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
      avatar: company.avatar,
      companies,
      doNotDisturb: company.doNotDisturb || 'No',
      ownerId: company.ownerId || '',
      parentCompanyId: company.parentCompanyId || '',
      users: []
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
    const company = this.props.company || ({} as ICompany);

    if (company.owner && company.owner.details) {
      this.handleUserSearch(company.owner.details.fullName);
    }
  }

  getInputElementValue(id) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  action(e) {
    const { names, primaryName, avatar } = this.state;
    e.preventDefault();

    this.props.action({
      doc: {
        avatar,
        businessType: this.getInputElementValue('company-businessType'),
        description: this.getInputElementValue('company-description'),
        doNotDisturb: this.state.doNotDisturb,
        email: this.getInputElementValue('company-email'),
        industry: this.getInputElementValue('company-industry'),
        leadStatus: this.getInputElementValue('company-leadStatus'),
        lifecycleState: this.getInputElementValue('company-lifecycleState'),
        links: {
          facebook: this.getInputElementValue('company-facebook'),
          github: this.getInputElementValue('company-github'),
          linkedIn: this.getInputElementValue('company-linkedIn'),
          twitter: this.getInputElementValue('company-twitter'),
          website: this.getInputElementValue('company-website'),
          youtube: this.getInputElementValue('company-youtube')
        },
        names,
        ownerId: this.state.ownerId,
        parentCompanyId: this.state.parentCompanyId,
        phone: this.getInputElementValue('company-phone'),
        primaryName,
        size: parseInt(this.getInputElementValue('company-size'), 10)
      }
    });

    this.props.closeModal();
  }

  onAvatarUpload(url: string) {
    this.setState({ avatar: url });
  }

  generateCompanyParams(companies) {
    return companies.map(company => ({
      label: company.primaryName || '',
      value: company._id
    }));
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

  handleSelect<T extends keyof State>(
    selectedOption: { value: State[T] },
    name: T
  ) {
    this.setState({
      [name]: selectedOption ? selectedOption.value : null
    } as Pick<State, keyof State>);
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
    const company = this.props.company || ({} as ICompany);

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
              componentClass: 'select',
              defaultValue: company.industry || '',
              id: 'company-industry',
              options: this.generateConstantParams(COMPANY_INDUSTRY_TYPES)
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

            {this.renderFormGroup('Email', {
              defaultValue: company.email || '',
              id: 'company-email'
            })}
            {this.renderFormGroup('Lead Status', {
              componentClass: 'select',
              defaultValue: company.leadStatus || '',
              id: 'company-leadStatus',
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
            {this.renderFormGroup('Business Type', {
              componentClass: 'select',
              defaultValue: company.businessType || '',
              id: 'company-businessType',
              options: this.generateConstantParams(COMPANY_BUSINESS_TYPES)
            })}
            {this.renderFormGroup('Size', {
              defaultValue: company.size || 0,
              id: 'company-size'
            })}
            {this.renderFormGroup('Phone', {
              defaultValue: company.phone || '',
              id: 'company-phone'
            })}
            {this.renderFormGroup('Lifecycle State', {
              componentClass: 'select',
              defaultValue: company.lifecycleState || '',
              id: 'company-lifecycleState',
              options: lifecycleStateChoices(__)
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
              id: 'company-linkedIn'
            })}

            {this.renderFormGroup('Twitter', {
              defaultValue: links.twitter || '',
              id: 'company-twitter'
            })}

            {this.renderFormGroup('Facebook', {
              defaultValue: links.facebook || '',
              id: 'company-facebook'
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Github', {
              defaultValue: links.github || '',
              id: 'company-github'
            })}

            {this.renderFormGroup('Youtube', {
              defaultValue: links.youtube || '',
              id: 'company-youtube'
            })}

            {this.renderFormGroup('Website', {
              defaultValue: links.website || '',
              id: 'company-website'
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
