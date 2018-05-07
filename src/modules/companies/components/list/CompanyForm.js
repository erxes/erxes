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
      users: []
    };

    this.action = this.action.bind(this);
    this.renderFormGroup = this.renderFormGroup.bind(this);
    this.handleCompanySearch = this.handleCompanySearch.bind(this);
    this.handleUserSearch = this.handleUserSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  action(doc) {
    this.props.action({
      doc: {
        ...doc,
        parentCompanyId: this.state.parentCompanyId,
        ownerId: this.state.ownerId,
        doNotDisturb: this.state.doNotDisturb,
        links: {
          linkedIn: doc.linkedIn,
          twitter: doc.twitter,
          facebook: doc.facebook,
          github: doc.github,
          youtube: doc.youtube,
          website: doc.website
        }
      }
    });

    this.context.closeModal();
  }

  generateCompanyParams(companies) {
    return companies.map(company => ({
      value: company._id,
      label: company.name || ''
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

  render() {
    const { __ } = this.context;
    const { company = {} } = this.props;
    const { links = {} } = company;
    const { companies, users } = this.state;

    return (
      <Form onSubmit={e => this.action(e)}>
        <FormWrapper>
          <FormColumn>
            {this.renderFormGroup('Name', {
              name: 'name',
              validations: 'isValue',
              validationError: 'Please enter a name',
              autoFocus: true,
              value: company.name || ''
            })}
            {this.renderFormGroup('Industry', {
              name: 'industry',
              validations: {},
              componentClass: 'select',
              value: company.industry || '',
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
              name: 'plan',
              validations: 'isValue',
              validationError: 'Please enter a plan',
              value: company.plan || ''
            })}
            {this.renderFormGroup('Lead Status', {
              name: 'leadStatus',
              validations: {},
              componentClass: 'select',
              value: company.leadStatus || '',
              options: this.generateConstantParams(COMPANY_LEAD_STATUS_TYPES)
            })}
            {this.renderFormGroup('Business Type', {
              name: 'businessType',
              validations: {},
              componentClass: 'select',
              value: company.businessType || '',
              options: this.generateConstantParams(COMPANY_BUSINESS_TYPES)
            })}
            {this.renderFormGroup('Employees count', {
              name: 'employees',
              validations: 'isValue',
              validationError: 'Please enter a employees count',
              value: company.employees || 0
            })}
          </FormColumn>
          <FormColumn>
            {this.renderFormGroup('Email', {
              name: 'email',
              validations: 'isEmail',
              validationError: 'Not a valid email format',
              value: company.email || ''
            })}
            {this.renderFormGroup('Size', {
              name: 'size',
              validations: 'isValue',
              validationError: 'Please enter a size',
              value: company.size || 0
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
              name: 'phone',
              validations: 'isValue',
              validationError: 'Please enter a phone',
              value: company.phone || ''
            })}
            {this.renderFormGroup('Lifecycle State', {
              componentClass: 'select',
              name: 'lifecycleState',
              validations: {},
              value: company.lifecycleState || '',
              options: this.generateConstantParams(
                COMPANY_LIFECYCLE_STATE_TYPES
              )
            })}
            {this.renderFormGroup('Description', {
              name: 'description',
              validations: '',
              value: company.description || ''
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
              name: 'linkedIn',
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
      </Form>
    );
  }
}

CompanyForm.propTypes = propTypes;
CompanyForm.contextTypes = contextTypes;

export default CompanyForm;
