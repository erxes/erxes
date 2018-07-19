import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  ModifiableSelect
} from 'modules/common/components';
import {
  ModalFooter,
  FormWrapper,
  FormColumn,
  ColumnTitle
} from 'modules/common/styles/main';
import { searchCompany, searchUser } from 'modules/common/utils';
import {
  COMPANY_INDUSTRY_TYPES,
  COMPANY_LEAD_STATUS_TYPES,
  COMPANY_LIFECYCLE_STATE_TYPES,
  COMPANY_BUSINESS_TYPES
} from '../../constants';

const propTypes = {
  action: PropTypes.func.isRequired,
  company: PropTypes.object
};

const contextTypes = {
  __: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

class CompanyForm extends React.Component {
  constructor(props) {
    super(props);

    const { company = {} } = props;

    this.state = {
      parentCompanyId: company.parentCompanyId || '',
      ownerId: company.ownerId || '',
      doNotDisturb: company.doNotDisturb || 'No',
      companies: [],
      users: [],
      names: company.names || [],
      primaryName: company.primaryName
    };

    this.action = this.action.bind(this);
    this.renderFormGroup = this.renderFormGroup.bind(this);
    this.handleCompanySearch = this.handleCompanySearch.bind(this);
    this.handleUserSearch = this.handleUserSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.addName = this.addName.bind(this);
    this.removeName = this.removeName.bind(this);
    this.setprimaryName = this.setprimaryName.bind(this);
  }

  componentDidMount() {
    const { company = {} } = this.props;

    if (company.ownerId) this.handleUserSearch(company.owner.details.fullName);
  }

  action(e) {
    const { names, primaryName } = this.state;
    e.preventDefault();

    this.props.action({
      doc: {
        names,
        primaryName,
        size: document.getElementById('company-size').value,
        industry: document.getElementById('company-industry').value,
        plan: document.getElementById('company-plan').value,
        parentCompanyId: this.state.parentCompanyId,
        email: document.getElementById('company-email').value,
        ownerId: this.state.ownerId,
        phone: document.getElementById('company-phone').value,
        leadStatus: document.getElementById('company-leadStatus').value,
        lifecycleState: document.getElementById('company-lifecycleState').value,
        businessType: document.getElementById('company-businessType').value,
        description: document.getElementById('company-description').value,
        employees: document.getElementById('company-employees').value,
        doNotDisturb: this.state.doNotDisturb,
        links: {
          linkedIn: document.getElementById('company-linkedIn').value,
          twitter: document.getElementById('company-twitter').value,
          facebook: document.getElementById('company-facebook').value,
          github: document.getElementById('company-github').value,
          youtube: document.getElementById('company-youtube').value,
          website: document.getElementById('company-website').value
        }
      }
    });

    this.context.closeModal();
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

  handleCompanySearch(value) {
    searchCompany(value, companies => this.setState({ companies }));
  }

  handleUserSearch(value) {
    searchUser(value, users => this.setState({ users }));
  }

  renderFormGroup(label, props) {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  }

  addName(value) {
    const { names } = this.state;

    this.setState({ names: [...names, value] });
  }

  removeName(value) {
    const { names } = this.state;

    this.setState({
      names: names.filter(name => name !== value)
    });
  }

  setprimaryName(option) {
    let primaryName = null;

    if (option) {
      primaryName = option.value;
    }

    this.setState({ primaryName });
  }

  render() {
    const { __ } = this.context;
    const { company = {} } = this.props;
    const { links = {} } = company;
    const { companies, users, names, primaryName } = this.state;

    return (
      <form onSubmit={e => this.action(e)}>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <ModifiableSelect
                value={primaryName}
                options={names}
                placeholder="Primary name"
                buttonText="Add name"
                onSave={v => this.addName(v)}
                onSelectChange={o => this.setprimaryName(o)}
                onRemoveOption={v => this.removeName(v)}
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
                onFocus={() =>
                  companies.length < 1 && this.handleCompanySearch('')
                }
                onInputChange={this.handleCompanySearch}
                onChange={option =>
                  this.handleSelect(option, 'parentCompanyId')
                }
                value={this.state.parentCompanyId}
                options={this.generateCompanyParams(companies)}
              />
            </FormGroup>
            {this.renderFormGroup('Plan', {
              id: 'company-plan',
              defaultValue: company.plan || ''
            })}
            {this.renderFormGroup('Lead Status', {
              id: 'company-leadStatus',
              componentClass: 'select',
              defaultValue: company.leadStatus || '',
              options: this.generateConstantParams(COMPANY_LEAD_STATUS_TYPES)
            })}
            {this.renderFormGroup('Business Type', {
              id: 'company-businessType',
              componentClass: 'select',
              defaultValue: company.businessType || '',
              options: this.generateConstantParams(COMPANY_BUSINESS_TYPES)
            })}
            {this.renderFormGroup('Employees count', {
              id: 'company-employees',
              defaultValue: company.employees || 0
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
                onFocus={() => users.length < 1 && this.handleUserSearch('')}
                onInputChange={this.handleUserSearch}
                onChange={option => this.handleSelect(option, 'ownerId')}
                value={this.state.ownerId}
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
              options: this.generateConstantParams(
                COMPANY_LIFECYCLE_STATE_TYPES
              )
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
              this.context.closeModal();
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

CompanyForm.propTypes = propTypes;
CompanyForm.contextTypes = contextTypes;

export default CompanyForm;
