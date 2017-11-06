import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarContent } from 'modules/layout/styles';
import {
  AvatarWrapper,
  ActivityRow,
  ActivityWrapper,
  ActivityCaption,
  IconWrapper
} from '../../styles';
import {
  Tip,
  ModalTrigger,
  Button,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { GenerateField } from 'modules/fields/components';
import { CompanyForm } from 'modules/companies/components';
import { Link } from 'react-router-dom';
import { NameCard } from 'modules/common/components';
import TaggerSection from './TaggerSection';
import MessengerSection from './MessengerSection';
import TwitterSection from './TwitterSection';
import FacebookSection from './FacebookSection';

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

  renderIcon(text, className) {
    if (!text) {
      return null;
    }

    return (
      <Tip text={text}>
        <Icon icon={className} size={15} />
      </Tip>
    );
  }

  renderBasicInfo() {
    const { customer } = this.props;

    return (
      <ActivityRow>
        <ActivityWrapper>
          <AvatarWrapper>
            <NameCard.Avatar customer={customer} size={60} />
          </AvatarWrapper>

          <ActivityCaption>{customer.name || 'N/A'}</ActivityCaption>

          <IconWrapper>
            {this.renderIcon(customer.email, 'email')}
            {this.renderIcon(customer.phone, 'ios-telephone')}
          </IconWrapper>
        </ActivityWrapper>
      </ActivityRow>
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

        <SidebarContent>
          {customer.companies.map((company, index) => (
            <div key={index}>
              <FormGroup>
                <ControlLabel>Name:</ControlLabel>
                <FormControl defaultValue={company.name} />
              </FormGroup>
            </div>
          ))}

          <ModalTrigger
            title="New company"
            trigger={
              <Button btnStyle="success" size="small">
                <Icon icon="plus" /> Add company
              </Button>
            }
          >
            <CompanyForm addCompany={addCompany} />
          </ModalTrigger>
        </SidebarContent>
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

        <SidebarContent>
          {customFields.map((field, index) => (
            <GenerateField
              field={field}
              key={index}
              defaultValue={customFieldsData[field._id]}
              onValueChange={this.onCustomFieldValueChange}
            />
          ))}

          <Link to="/fields/manage/customer">
            <Button btnStyle="simple" size="small">
              <Icon icon="gear-a" /> Customize
            </Button>
          </Link>
        </SidebarContent>
      </Section>
    );
  }

  render() {
    const { customer } = this.props;

    return (
      <Wrapper.Sidebar size="wide">
        <form onSubmit={this.onSubmit}>
          {this.renderBasicInfo()}
          {this.renderCustomFields()}
          {this.renderCompanies()}

          <MessengerSection customer={customer} />
          <TwitterSection customer={customer} />
          <FacebookSection customer={customer} />
          <TaggerSection customer={customer} />

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
