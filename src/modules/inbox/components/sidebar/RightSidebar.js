import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import {
  MessengerSection,
  TwitterSection,
  FacebookSection,
  BasicInfo,
  TaggerSection
} from 'modules/customers/components/detail/sidebar';
import { SidebarContent } from 'modules/layout/styles';
import { Alert } from 'modules/common/utils';
import ConversationDetails from './ConversationDetails';
import { Link } from 'react-router-dom';
import {
  AboutList,
  CompaniesWrapper,
  CompanyWrapper
} from 'modules/customers/styles';
import { GenerateField } from 'modules/fields/components';
import { Button, Icon, ModalTrigger } from 'modules/common/components';
import { CompanyForm } from 'modules/companies/components';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  customFields: PropTypes.array.isRequired,
  addCompany: PropTypes.func.isRequired
};

class RightSidebar extends Component {
  constructor(props) {
    super(props);
    const { customer = {} } = this.props.conversation;
    this.defaultCustomFieldsData = {
      ...(customer.customFieldsData || {})
    };

    this.state = {
      fieldsEditing: false,
      fieldsData: this.defaultCustomFieldsData
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.save = this.save.bind(this);
    this.handleFieldsChange = this.handleFieldsChange.bind(this);
  }

  toggleEditing() {
    this.cancelEditing();
    this.setState({ fieldsEditing: true });
  }

  cancelEditing() {
    this.setState({
      fieldsEditing: false,
      fieldsData: this.defaultCustomFieldsData
    });
  }

  save() {
    const doc = {
      customFieldsData: this.state.fieldsData
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.defaultCustomFieldsData = this.state.fieldsData;
      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  handleFieldsChange({ _id, value }) {
    this.toggleEditing();
    const { fieldsData } = this.state;
    const newfields = {
      ...fieldsData,
      [_id]: value
    };
    this.setState({ fieldsData: newfields });
  }

  renderCompanies() {
    const { customer = {} } = this.props.conversation;

    return (
      <Sidebar.Section className="full">
        <Sidebar.Section.Title>Companies</Sidebar.Section.Title>

        <CompaniesWrapper>
          <Sidebar.Section.QuickButtons>
            <ModalTrigger title="New company" trigger={<Icon icon="plus" />}>
              <CompanyForm addCompany={this.props.addCompany} />
            </ModalTrigger>
          </Sidebar.Section.QuickButtons>
          {customer.companies.map((company, index) => (
            <CompanyWrapper key={index}>
              <Link to={'/companies/details/' + company._id}>
                <Icon icon="android-arrow-forward" />
              </Link>
              <span>{company.name || 'N/A'}</span>
              <span>{company.website}</span>
            </CompanyWrapper>
          ))}
        </CompaniesWrapper>
      </Sidebar.Section>
    );
  }

  renderCustomFields() {
    return (
      <Sidebar.Section className="full">
        <Sidebar.Section.Title>About</Sidebar.Section.Title>
        <Sidebar.Section.QuickButtons>
          <Link to="/fields/manage/customer">
            <Icon icon="gear-a" />
          </Link>
        </Sidebar.Section.QuickButtons>
        <SidebarContent>
          <AboutList>
            {this.props.customFields.map((field, index) => (
              <GenerateField
                field={field}
                key={index}
                onValueChange={this.handleFieldsChange}
                defaultValue={this.state.fieldsData[field._id] || ''}
              />
            ))}
          </AboutList>
        </SidebarContent>
      </Sidebar.Section>
    );
  }

  renderSidebarFooter() {
    return this.state.fieldsEditing ? (
      <Sidebar.Footer>
        <Button btnStyle="simple" size="small" onClick={this.cancelEditing}>
          <Icon icon="close" />Discard
        </Button>
        <Button btnStyle="success" size="small" onClick={this.save}>
          <Icon icon="checkmark" />Save
        </Button>
      </Sidebar.Footer>
    ) : null;
  }

  render() {
    const { customer = {} } = this.props.conversation;
    return (
      <Sidebar footer={this.renderSidebarFooter()}>
        <BasicInfo customer={customer} save={this.props.save} />
        {this.renderCustomFields()}
        {this.renderCompanies()}
        <MessengerSection customer={customer} />
        <TwitterSection customer={customer} />
        <FacebookSection customer={customer} />
        <ConversationDetails conversation={this.props.conversation} />
        <TaggerSection customer={customer} />
      </Sidebar>
    );
  }
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
