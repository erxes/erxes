import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import parse from 'ua-parser-js';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent, QuickButton } from 'modules/layout/styles';
import {
  ModalTrigger,
  Button,
  Icon,
  Tip,
  EmptyState
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { GenerateField } from 'modules/fields/components';
import { CompanyAssociate } from 'modules/companies/containers';
import { BasicInfo } from 'modules/customers/components/detail/sidebar';
import { CompanyWrapper, BlockValue } from './styles';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

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
  sections: PropTypes.node,
  otherProperties: PropTypes.node
};

class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      customData: {}
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
      customData: this.props.customer.customFieldsData || {}
    });
  }

  save() {
    const doc = {
      customFieldsData: this.state.customData
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

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
    const { customer } = this.props;
    const { Section } = Sidebar;

    const companyTrigger = (
      <QuickButton>
        <Icon icon="plus" />
      </QuickButton>
    );

    return (
      <Section>
        <Section.Title>Companies</Section.Title>
        <Section.QuickButtons>
          <ModalTrigger title="Associate" trigger={companyTrigger} size="lg">
            <CompanyAssociate data={customer} />
          </ModalTrigger>
        </Section.QuickButtons>
        {customer.companies.map((company, index) => (
          <CompanyWrapper key={index}>
            <Link to={`/companies/details/${company._id}`}>
              <Icon icon="android-open" />
            </Link>
            <div>{company.name || 'N/A'}</div>
            <Tip text={company.website || ''}>
              <span>
                <a target="_blank" href={`//${company.website}`}>
                  {company.website}
                </a>
              </span>
            </Tip>
          </CompanyWrapper>
        ))}

        {customer.companies.length === 0 && (
          <EmptyState icon="briefcase" text="No company" />
        )}
      </Section>
    );
  }

  renderDeviceProperty(text, value, secondValue, nowrap) {
    if (value || secondValue) {
      return (
        <li>
          {text}:
          {nowrap ? (
            <BlockValue>
              {value} {secondValue}
            </BlockValue>
          ) : (
            <SidebarCounter>
              {value} {secondValue}
            </SidebarCounter>
          )}
        </li>
      );
    }

    return null;
  }

  renderCustomFields() {
    const { customFields, customer } = this.props;
    const { Section } = Sidebar;

    return (
      <Section>
        <Section.Title>Customer properties</Section.Title>
        <Section.QuickButtons>
          <Link to="/fields/manage/customer">
            <Icon icon="gear-a" />
          </Link>
        </Section.QuickButtons>
        <SidebarContent>
          {customFields.map((field, index) => (
            <GenerateField
              field={field}
              key={index}
              onValueChange={this.handleFieldsChange}
              defaultValue={
                customer.customFieldsData
                  ? customer.customFieldsData[field._id]
                  : ''
              }
            />
          ))}
        </SidebarContent>
      </Section>
    );
  }

  renderDeviceProperties() {
    const { customer } = this.props;
    const { Section } = Sidebar;
    const location = customer.location;

    if (location) {
      const ua = parse(location.userAgent || ' ');
      return (
        <Section>
          <Section.Title>Device properties</Section.Title>
          <SidebarList className="no-link">
            {this.renderDeviceProperty('Region', location.region)}
            {this.renderDeviceProperty(
              'Location',
              location.city,
              location.country
            )}
            {this.renderDeviceProperty(
              'Browser',
              ua.browser.name,
              ua.browser.version
            )}
            {this.renderDeviceProperty('Platform', ua.os.name, ua.os.version)}
            {this.renderDeviceProperty('IP Address', location.remoteAddress)}
            {this.renderDeviceProperty('Hostname', location.hostname)}
            {this.renderDeviceProperty('Language', location.language)}
            {this.renderDeviceProperty(
              'User Agent',
              location.userAgent,
              null,
              true
            )}
          </SidebarList>
        </Section>
      );
    }

    return null;
  }

  renderOtherProperties() {
    const { otherProperties } = this.props;
    const { Section } = Sidebar;

    if (otherProperties) {
      return (
        <Section>
          <Section.Title>Other properties</Section.Title>
          <SidebarList className="no-link">{otherProperties}</SidebarList>
        </Section>
      );
    }

    return null;
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
      <Sidebar footer={this.renderSidebarFooter()}>
        <BasicInfo customer={customer} save={this.props.save} />
        {this.props.sections && this.props.sections}
        {this.renderCustomFields()}
        {this.renderCompanies()}
        {this.renderDeviceProperties()}
        {this.renderOtherProperties()}
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
