import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent } from 'modules/layout/styles';
import { GenerateField } from 'modules/fields/components';
import { ModalTrigger, Button, Icon } from 'modules/common/components';
import { CompanyForm } from 'modules/companies/components';
import { Link } from 'react-router-dom';
import {
  BasicInfo,
  TaggerSection,
  MessengerSection,
  TwitterSection,
  FacebookSection
} from './';
import { Alert } from 'modules/common/utils';
import { AboutList, CompaniesWrapper, CompanyWrapper } from '../../../styles';

const propTypes = {
  customer: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  addCompany: PropTypes.func.isRequired
};

class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.defaultCustomFieldsData = {
      ...(props.customer.customFieldsData || {})
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
    const { addCompany, customer } = this.props;

    return (
      <Sidebar.Section className="full">
        <Sidebar.Section.Title>Companies</Sidebar.Section.Title>

        <CompaniesWrapper>
          <Sidebar.Section.QuickButtons>
            <ModalTrigger title="New company" trigger={<Icon icon="plus" />}>
              <CompanyForm addCompany={addCompany} />
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
    const { customFields } = this.props;

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
            {customFields.map((field, index) => (
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
    const { customer } = this.props;

    return (
      <Sidebar size="wide" footer={this.renderSidebarFooter()}>
        <BasicInfo customer={customer} save={this.props.save} />
        {this.renderCustomFields()}
        {this.renderCompanies()}

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
