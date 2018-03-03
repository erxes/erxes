import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import parse from 'ua-parser-js';
import { Sidebar } from 'modules/layout/components';
import {
  ModalTrigger,
  Button,
  Icon,
  Tip,
  EmptyState
} from 'modules/common/components';
import { urlParser } from 'modules/common/utils';
import { ManageGroups } from 'modules/settings/properties/components';
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
  save: PropTypes.func.isRequired,
  sections: PropTypes.node,
  otherProperties: PropTypes.node,
  fieldsGroups: PropTypes.array.isRequired,
  customFieldsData: PropTypes.object
};

class LeftSidebar extends ManageGroups {
  renderCompanies() {
    const { customer } = this.props;
    const { Section } = Sidebar;
    const { __ } = this.context;

    const companyTrigger = (
      <a>
        <Icon icon="plus" />
      </a>
    );

    return (
      <Section>
        <Section.Title>{__('Companies')}</Section.Title>
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
                  {urlParser.extractRootDomain(company.website)}
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
    const { __ } = this.context;
    if (value || secondValue) {
      return (
        <li>
          {__(text)}:
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

  renderDeviceProperties() {
    const { customer } = this.props;
    const { Section } = Sidebar;
    const { __ } = this.context;
    const location = customer.location;

    if (location) {
      const ua = parse(location.userAgent || ' ');
      return (
        <Section>
          <Section.Title>{__('Device properties')}</Section.Title>
          <SidebarList className="no-link">
            {this.renderDeviceProperty('Location', location.country)}
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
    const { __ } = this.context;

    if (otherProperties) {
      return (
        <Section>
          <Section.Title>{__('Other properties')}</Section.Title>
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
        <Button
          btnStyle="simple"
          size="small"
          onClick={this.cancelEditing}
          icon="close"
        >
          Discard
        </Button>
        <Button
          btnStyle="success"
          size="small"
          onClick={this.save}
          icon="checkmark"
        >
          Save
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
        {this.renderGroups()}
        {this.renderCompanies()}
        {this.renderDeviceProperties()}
        {this.renderOtherProperties()}
        <MessengerSection customer={customer} />
        <TwitterSection customer={customer} />
        <FacebookSection customer={customer} />
        <TaggerSection data={customer} type="customer" />
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;
LeftSidebar.contextTypes = {
  __: PropTypes.func
};

export default LeftSidebar;
