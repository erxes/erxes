import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent } from 'modules/layout/styles';
import { ModalTrigger, Button, Icon, Tip } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { GenerateField } from 'modules/fields/components';
import { CompanyForm } from 'modules/companies/components';
import { BasicInfo } from 'modules/customers/components/detail/sidebar';
import { AboutList, CompaniesWrapper, CompanyWrapper } from './styles';
import {
  TaggerSection,
  MessengerSection,
  TwitterSection,
  FacebookSection
} from './';

const propTypes = {
  customer: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  addCompany: PropTypes.func.isRequired,
  sections: PropTypes.node
};

class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.defaultCustomFieldsData = {
      ...(props.customer.customFieldsData || {})
    };
    this.state = {
      editing: false,
      customData: this.defaultCustomFieldsData
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.save = this.save.bind(this);
    this.handleFieldsChange = this.handleFieldsChange.bind(this);
  }

  toggleEditing() {
    this.cancelEditing();
    this.setState({ editing: true });
  }

  cancelEditing() {
    this.setState({
      editing: false,
      customData: this.defaultCustomFieldsData
    });
  }

  save() {
    const doc = {
      customFieldsData: this.state.customData
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.defaultCustomFieldsData = this.state.customData;
      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  handleFieldsChange({ _id, value }) {
    this.toggleEditing();
    const { customData } = this.state;
    const newfields = {
      ...customData,
      [_id]: value
    };
    this.setState({ customData: newfields });
  }

  renderCompanies() {
    const { addCompany, customer } = this.props;

    return (
      <Sidebar.Section>
        <Sidebar.Section.Title>Companies</Sidebar.Section.Title>

        <CompaniesWrapper>
          <Sidebar.Section.QuickButtons>
            <ModalTrigger title="New company" trigger={<Icon icon="plus" />}>
              <CompanyForm addCompany={addCompany} />
            </ModalTrigger>
          </Sidebar.Section.QuickButtons>
          {customer.companies.map((company, index) => (
            <CompanyWrapper key={index}>
              <Link to={`/companies/details/${company._id}`}>
                <Icon icon="android-arrow-forward" />
              </Link>
              <span>{company.name || 'N/A'}</span>
              <Tip text={company.website || ''}>
                <span>{company.website}</span>
              </Tip>
            </CompanyWrapper>
          ))}
        </CompaniesWrapper>
      </Sidebar.Section>
    );
  }

  renderCustomFields() {
    const { customFields } = this.props;

    return (
      <Sidebar.Section>
        <Sidebar.Section.Title>About</Sidebar.Section.Title>
        <Sidebar.Section.QuickButtons>
          <Link to="/fields/manage/customer">
            <Icon icon="gear-a" />
          </Link>
        </Sidebar.Section.QuickButtons>
        <SidebarContent>
          <AboutList>
            {customFields.map((field, index) => (
              <GenerateField
                field={field}
                key={index}
                onValueChange={this.handleFieldsChange}
                defaultValue={this.state.customData[field._id] || ''}
              />
            ))}
          </AboutList>
        </SidebarContent>
      </Sidebar.Section>
    );
  }

  renderSidebarFooter() {
    if (!this.state.editing) {
      return null;
    }

    return (
      <Sidebar.Footer>
        <Button btnStyle="simple" size="small" onClick={this.cancelEditing}>
          <Icon icon="close" />Discard
        </Button>
        <Button btnStyle="success" size="small" onClick={this.save}>
          <Icon icon="checkmark" />Save
        </Button>
      </Sidebar.Footer>
    );
  }

  render() {
    const { customer } = this.props;

    return (
      <Sidebar size="wide" footer={this.renderSidebarFooter()}>
        <BasicInfo customer={customer} save={this.props.save} />
        {this.renderCustomFields()}
        {this.renderCompanies()}
        {this.props.sections ? this.props.sections : null}
        <MessengerSection customer={customer} />
        <TwitterSection customer={customer} />
        <FacebookSection customer={customer} />
        <TaggerSection customer={customer} />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;

export default LeftSidebar;
