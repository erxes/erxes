import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { Icon, ModalTrigger } from 'modules/common/components';
import { Links } from 'modules/settings/team/components/detail/styles';
import { CompanyForm } from '../';

const propTypes = {
  company: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class BasicInfo extends React.Component {
  renderLink(link, icon) {
    if (link) {
      return (
        <a href={link} target="_blank">
          <Icon icon={icon} />
        </a>
      );
    }
    return null;
  }

  renderLinks(links) {
    return (
      <Links>
        {this.renderLink(links.linkedIn, 'social-linkedin')}
        {this.renderLink(links.twitter, 'social-twitter')}
        {this.renderLink(links.facebook, 'social-facebook')}
        {this.renderLink(links.github, 'social-github')}
        {this.renderLink(links.youtube, 'social-youtube')}
        {this.renderLink(links.website, 'android-globe')}
      </Links>
    );
  }

  renderInfo() {
    const { __ } = this.context;
    const { company, save } = this.props;
    const { links = {} } = company;
    const { Title, QuickButtons } = Sidebar.Section;

    return (
      <Sidebar.Section>
        <Title>{__('Basic Info')}</Title>

        <QuickButtons>
          <ModalTrigger title="Edit" trigger={<Icon icon="edit" />} size="lg">
            <CompanyForm action={save} company={company} />
          </ModalTrigger>
        </QuickButtons>

        <Title>{this.renderLinks(links)}</Title>

        <SidebarList className="no-link">
          <li>
            {__('Name:')}
            <SidebarCounter>{company.name || '-'}</SidebarCounter>
          </li>
          <li>
            {__('Size:')}
            <SidebarCounter>{company.size || '-'}</SidebarCounter>
          </li>
          <li>
            {__('Website:')}
            <SidebarCounter>{company.website || '-'}</SidebarCounter>
          </li>
          <li>
            {__('Industry:')}
            <SidebarCounter>{company.industry || '-'}</SidebarCounter>
          </li>
          <li>
            {__('Plan:')}
            <SidebarCounter>{company.plan || '-'}</SidebarCounter>
          </li>
          <li>
            Parent Company:
            <SidebarCounter>{company.parentCompanyId || '-'}</SidebarCounter>
          </li>
          <li>
            Email:
            <SidebarCounter>{company.email || '-'}</SidebarCounter>
          </li>
          <li>
            Owner:
            <SidebarCounter>{company.ownerId || '-'}</SidebarCounter>
          </li>
          <li>
            Phone:
            <SidebarCounter>{company.phone || '-'}</SidebarCounter>
          </li>
          <li>
            Lead Status:
            <SidebarCounter>{company.leadStatus || '-'}</SidebarCounter>
          </li>
          <li>
            Lifecycle State:
            <SidebarCounter>{company.lifecycleState || '-'}</SidebarCounter>
          </li>
          <li>
            Business Type:
            <SidebarCounter>{company.businessType || '-'}</SidebarCounter>
          </li>
          <li>
            Description:
            <SidebarCounter>{company.description || '-'}</SidebarCounter>
          </li>
          <li>
            Employees:
            <SidebarCounter>{company.employees || '-'}</SidebarCounter>
          </li>
          <li>
            Do Not Disturb:
            <SidebarCounter>{company.doNotDisturb || '-'}</SidebarCounter>
          </li>
        </SidebarList>
      </Sidebar.Section>
    );
  }

  render() {
    return this.renderInfo();
  }
}

BasicInfo.propTypes = propTypes;
BasicInfo.contextTypes = contextTypes;

export default BasicInfo;
