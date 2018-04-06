import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { Icon, ModalTrigger } from 'modules/common/components';
import { Links, InfoWrapper } from 'modules/common/styles/styles';
import { CompanyForm } from '../../containers';
import { CompanyLogo } from '../../styles';

const propTypes = {
  company: PropTypes.object.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class BasicInfo extends React.Component {
  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
  }

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

  renderRow(label, value) {
    const { __ } = this.context;

    return (
      <li>
        {__(`${label}`)}:
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  }

  renderInfo() {
    const { company } = this.props;
    const { links = {} } = company;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <CompanyLogo />
          <div className="name">
            {company.name}
            {this.renderLinks(links)}
          </div>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="lg"
          >
            <CompanyForm company={company} />
          </ModalTrigger>
        </InfoWrapper>

        <SidebarList className="no-link">
          {this.renderRow('Size', company.size)}
          {this.renderRow('Industry', company.industry)}
          {this.renderRow('Plan', company.plan)}
          {this.renderRow(
            'Parent Company',
            company.parentCompany ? company.parentCompany.name : '-'
          )}
          {this.renderRow('Email', company.email)}
          {this.renderRow(
            'Owner',
            company.owner ? company.owner.details.fullName : '-'
          )}
          {this.renderRow('Phone', company.phone)}
          {this.renderRow('Lead Status', company.leadStatus)}
          {this.renderRow('Lifecycle State', company.lifecycleState)}
          {this.renderRow('Business Type', company.businessType)}
          {this.renderRow('Description', company.description)}
          {this.renderRow('Employees count', company.employees)}
          {this.renderRow('Do not disturb', company.doNotDisturb)}
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
