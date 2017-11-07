import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { GenerateField } from 'modules/fields/components';
import { CustomerForm } from 'modules/customers/components';
import { Link } from 'react-router-dom';
import { SidebarContent } from 'modules/layout/styles';
import {
  ModalTrigger,
  Button,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';

const propTypes = {
  company: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  addCustomer: PropTypes.func.isRequired
};

class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.customFieldsData = { ...(props.company.customFieldsData || {}) };

    this.onSubmit = this.onSubmit.bind(this);
    this.onCustomFieldValueChange = this.onCustomFieldValueChange.bind(this);
  }

  onCustomFieldValueChange({ _id, value }) {
    this.customFieldsData[_id] = value;
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.save({
      name: document.getElementById('name').value,
      size: document.getElementById('size').value,
      industry: document.getElementById('industry').value,
      website: document.getElementById('website').value,
      plan: document.getElementById('plan').value,
      customFieldsData: this.customFieldsData
    });
  }

  renderBasicInfo() {
    const { company } = this.props;
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section className="full">
        <Title>Basic info</Title>

        <SidebarContent>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl id="name" defaultValue={company.name} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Size</ControlLabel>
            <FormControl id="size" defaultValue={company.size} type="number" />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Industry</ControlLabel>
            <FormControl id="industry" defaultValue={company.industry} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Website</ControlLabel>
            <FormControl id="website" defaultValue={company.website} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Plan</ControlLabel>
            <FormControl id="plan" defaultValue={company.plan} />
          </FormGroup>
        </SidebarContent>
      </Section>
    );
  }

  renderCustomFields() {
    const { company, customFields } = this.props;
    const customFieldsData = company.customFieldsData || {};
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section className="full">
        <Title>About</Title>

        <SidebarContent>
          {customFields.map((field, index) => (
            <GenerateField
              field={field}
              key={index}
              defaultValue={customFieldsData[field._id]}
              onValueChange={this.onCustomFieldValueChange}
            />
          ))}

          <Link to="/fields/manage/company">
            <Button btnStyle="simple" size="small">
              <Icon icon="gear-a" /> Customize
            </Button>
          </Link>
        </SidebarContent>
      </Section>
    );
  }

  renderCustomers() {
    const { company, addCustomer } = this.props;
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section className="full">
        <Title>Customers</Title>

        <SidebarContent>
          {company.customers.map((customer, index) => (
            <div key={index}>
              <FormGroup>
                <ControlLabel>Name:</ControlLabel>
                <FormControl value={customer.name || 'N/A'} />
              </FormGroup>
            </div>
          ))}

          <ModalTrigger
            title="New customer"
            trigger={
              <Button btnStyle="success" size="small">
                <Icon icon="plus" /> Add customer
              </Button>
            }
          >
            <CustomerForm addCustomer={addCustomer} />
          </ModalTrigger>
        </SidebarContent>
      </Section>
    );
  }

  render() {
    return (
      <Wrapper.Sidebar size="wide">
        <form onSubmit={this.onSubmit} className="cc-detail-form">
          {this.renderBasicInfo()}
          {this.renderCustomers()}
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
