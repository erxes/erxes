import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { ModalTrigger, Button, Icon } from 'modules/common/components';
import { GenerateField } from 'modules/fields/components';
import { CompanyForm } from 'modules/companies/components';

const propTypes = {
  customer: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  addCompany: PropTypes.func.isRequired
};

class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.customFieldsData = { ...(props.customer.customFieldsData || {}) };

    this.onSubmit = this.onSubmit.bind(this);
    this.onCustomFieldValueChange = this.onCustomFieldValueChange.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.save({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      customFieldsData: this.customFieldsData
    });
  }

  onCustomFieldValueChange({ _id, value }) {
    this.customFieldsData[_id] = value;
  }

  renderBasicInfo() {
    const { customer } = this.props;
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section className="full">
        <Title>Basic info</Title>

        <div className="sidebar-content">
          <p>
            <label>Name</label>
            <input id="name" defaultValue={customer.name} />
          </p>

          <p>
            <label>Email</label>
            <input id="email" defaultValue={customer.email} />
          </p>

          <p>
            <label>Phone</label>
            <input id="phone" defaultValue={customer.phone} />
          </p>
        </div>
      </Section>
    );
  }

  renderCompanies() {
    const { addCompany, customer } = this.props;
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section className="full">
        <Title>Companies</Title>

        <div className="sidebar-content">
          {customer.companies.map((company, index) => (
            <div key={index}>
              <p>
                <label>Name:</label>
                <input value={company.name} />
              </p>
            </div>
          ))}

          <ModalTrigger
            title="New company"
            trigger={<a className="action-link">Add company</a>}
          >
            <CompanyForm addCompany={addCompany} />
          </ModalTrigger>
        </div>
      </Section>
    );
  }

  renderCustomFields() {
    const { customer, customFields } = this.props;
    const customFieldsData = customer.customFieldsData || {};
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section className="full">
        <Title>About</Title>

        <div className="sidebar-content">
          {customFields.map((field, index) => (
            <GenerateField
              field={field}
              key={index}
              defaultValue={customFieldsData[field._id]}
              onValueChange={this.onCustomFieldValueChange}
            />
          ))}

          <a className="action-link" href="/fields/manage/customer">
            Customize
          </a>
        </div>
      </Section>
    );
  }

  render() {
    return (
      <Wrapper.Sidebar size="wide">
        <form onSubmit={this.onSubmit} className="cc-detail-form">
          {this.renderBasicInfo()}
          {this.renderCompanies()}
          {this.renderCustomFields()}

          <Button type="submit" btnStyle="success">
            <Icon icon="checkmark" /> Save changes
          </Button>
        </form>
      </Wrapper.Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;

export default LeftSidebar;
