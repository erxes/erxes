import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';
import { FormWrapper, FormColumn, ColumnTitle } from 'modules/customers/styles';
import {
  COMPANY_INDUSTRY_TYPES,
  COMPANY_LEAD_STATUS_TYPES,
  COMPANY_LIFECYCLE_STATE_TYPES,
  COMPANY_BUSINESS_TYPES
} from '../../constants';

const propTypes = {
  action: PropTypes.func.isRequired,
  company: PropTypes.object,
  users: PropTypes.array,
  companies: PropTypes.array,
  companiesQuery: PropTypes.object
};

const contextTypes = {
  __: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

class CompanyForm extends React.Component {
  constructor(props) {
    super(props);

    this.action = this.action.bind(this);
  }

  action(e) {
    e.preventDefault();

    const name = document.getElementById('company-name');
    const size = document.getElementById('company-size');
    const industry = document.getElementById('company-industry');
    const plan = document.getElementById('company-plan');
    const parentCompany = document.getElementById('company-parentCompany');
    const email = document.getElementById('company-email');
    const owner = document.getElementById('company-owner');
    const phone = document.getElementById('company-phone');
    const leadStatus = document.getElementById('company-leadStatus');
    const lifecycleState = document.getElementById('company-lifecycleState');
    const businessType = document.getElementById('company-businessType');
    const description = document.getElementById('company-description');
    const employees = document.getElementById('company-employees');
    const doNotDisturb = document.getElementById('company-doNotDisturb');

    const linkedIn = document.getElementById('company-linkedIn');
    const twitter = document.getElementById('company-twitter');
    const facebook = document.getElementById('company-facebook');
    const github = document.getElementById('company-github');
    const youtube = document.getElementById('company-youtube');
    const website = document.getElementById('company-website');

    this.props.action({
      doc: {
        name: name.value,
        website: website.value,
        size: size.value,
        industry: industry.value,
        plan: plan.value,
        parentCompanyId: parentCompany.value,
        email: email.value,
        ownerId: owner.value,
        phone: phone.value,
        leadStatus: leadStatus.value,
        lifecycleState: lifecycleState.value,
        businessType: businessType.value,
        description: description.value,
        employees: employees.value,
        doNotDisturb: doNotDisturb.value,
        links: {
          linkedIn: linkedIn.value,
          twitter: twitter.value,
          facebook: facebook.value,
          github: github.value,
          youtube: youtube.value,
          website: website.value
        }
      },

      callback: () => {
        name.value = '';
        website.value = '';
        if (document.activeElement.name === 'close') this.context.closeModal();
      }
    });
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

  render() {
    const { __ } = this.context;
    const { company = {}, companies, users } = this.props;
    const { links = {} } = company;

    return (
      <form onSubmit={e => this.action(e)}>
        <FormWrapper>
          <FormColumn>
            <ColumnTitle>{__('Basics')}</ColumnTitle>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                id="company-name"
                type="text"
                autoFocus
                defaultValue={company.name || ''}
                required
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Size</ControlLabel>
              <FormControl
                id="company-size"
                type="text"
                defaultValue={company.size || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Industry</ControlLabel>
              <FormControl
                id="company-industry"
                componentClass="select"
                defaultValue={company.industry || ''}
              >
                <option />
                {COMPANY_INDUSTRY_TYPES.ALL.map((type, index) => {
                  return <option key={index}>{type}</option>;
                })}
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Plan</ControlLabel>
              <FormControl
                id="company-plan"
                type="text"
                defaultValue={company.plan || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Parent Company</ControlLabel>
              <Select
                placeholder="Search..."
                value={company.parentCompanyId || ''}
                options={this.generateCompanyParams(companies)}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <FormControl
                id="company-email"
                type="text"
                defaultValue={company.email || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Owner</ControlLabel>
              <Select
                placeholder="Search..."
                value={company.ownerId || ''}
                options={this.generateUserParams(users)}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Phone</ControlLabel>
              <FormControl
                id="company-phone"
                type="text"
                defaultValue={company.phone || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Lead Status</ControlLabel>
              <FormControl
                id="company-leadStatus"
                componentClass="select"
                defaultValue={company.leadStatus || ''}
              >
                <option />
                {COMPANY_LEAD_STATUS_TYPES.ALL.map((type, index) => {
                  return <option key={index}>{type}</option>;
                })}
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Lifecycle State</ControlLabel>
              <FormControl
                id="company-lifecycleState"
                componentClass="select"
                defaultValue={company.lifecycleState || ''}
              >
                <option />
                {COMPANY_LIFECYCLE_STATE_TYPES.ALL.map((type, index) => {
                  return <option key={index}>{type}</option>;
                })}
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Business Type</ControlLabel>
              <FormControl
                id="company-businessType"
                componentClass="select"
                defaultValue={company.businessType || ''}
              >
                <option />
                {COMPANY_BUSINESS_TYPES.ALL.map((type, index) => {
                  return <option key={index}>{type}</option>;
                })}
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                id="company-description"
                type="text"
                defaultValue={company.description || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Employees</ControlLabel>
              <FormControl
                id="company-employees"
                type="text"
                defaultValue={company.employees || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Do Not Disturb</ControlLabel>
              <FormControl
                componentClass="radio"
                name="doNotDisturb"
                value="Yes"
                checked={company.doNotDisturb === 'Yes'}
              >
                Yes
              </FormControl>
              <FormControl
                componentClass="radio"
                name="doNotDisturb"
                value="No"
                checked={company.doNotDisturb === 'No'}
              >
                No
              </FormControl>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <ColumnTitle>{__('Links')}</ColumnTitle>

            <FormGroup>
              <ControlLabel>LinkedIn</ControlLabel>
              <FormControl
                id="company-linkedIn"
                type="text"
                defaultValue={links.linkedIn || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Twitter</ControlLabel>
              <FormControl
                id="company-twitter"
                type="text"
                defaultValue={links.twitter || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Facebook</ControlLabel>
              <FormControl
                id="company-facebook"
                type="text"
                defaultValue={links.facebook || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Github</ControlLabel>
              <FormControl
                id="company-github"
                type="text"
                defaultValue={links.github || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Youtube</ControlLabel>
              <FormControl
                id="company-youtube"
                type="text"
                defaultValue={links.youtube || ''}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Website</ControlLabel>
              <FormControl
                id="company-website"
                type="text"
                defaultValue={links.linkedIn || ''}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="close"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save & New
          </Button>

          <Button btnStyle="primary" type="submit" name="close" icon="close">
            Save & Close
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

CompanyForm.propTypes = propTypes;
CompanyForm.contextTypes = contextTypes;

export default CompanyForm;
