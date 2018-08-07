import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import {
  DropdownToggle,
  Button,
  Icon,
  ModalTrigger
} from 'modules/common/components';
import { Links, InfoWrapper } from 'modules/common/styles/main';
import { confirm, searchCompany } from 'modules/common/utils';
import { TargetMergeModal } from 'modules/customers/components';
import {
  LEAD_STATUS_TYPES,
  LIFECYCLE_STATE_TYPES
} from 'modules/customers/constants';
import { Action } from 'modules/customers/styles';
import { COMPANY_INFO } from 'modules/companies/constants';
import { CompanyForm } from '../../containers';
import { CompanyLogo } from '../../styles';

const propTypes = {
  company: PropTypes.object.isRequired,
  remove: PropTypes.func,
  merge: PropTypes.func
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
        <a target="_blank" href={link}>
          <Icon icon={icon} />
        </a>
      );
    }
    return null;
  }

  renderLinks(links) {
    return (
      <Links>
        {this.renderLink(links.facebook, 'facebook')}
        {this.renderLink(links.twitter, 'twitter')}
        {this.renderLink(links.linkedIn, 'linkedin-logo')}
        {this.renderLink(links.youtube, 'youtube')}
        {this.renderLink(links.github, 'github')}
        {this.renderLink(links.website, 'earthgrid')}
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

  renderAction() {
    const { __ } = this.context;
    const { remove, merge, company } = this.props;

    return (
      <Action>
        <Dropdown id="dropdown-engage">
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="simple" size="medium" icon="downarrow">
              {__('Action')}
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>
            <li>
              <TargetMergeModal
                onSave={merge}
                object={company}
                searchObject={searchCompany}
                basicInfos={COMPANY_INFO}
              />
            </li>
            <li>
              <a onClick={() => confirm().then(() => remove())}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Action>
    );
  }

  renderInfo() {
    const { company } = this.props;
    const { __ } = this.context;
    const { links = {} } = company;

    const leadStatusDisplay = __(LEAD_STATUS_TYPES[company.leadStatus]);
    const lifecycleStateDisplay = __(
      LIFECYCLE_STATE_TYPES[company.lifecycleState]
    );

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <CompanyLogo />
          <div className="name">
            {company.primaryName}
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

        {this.renderAction()}

        <SidebarList className="no-link">
          {this.renderRow('Size', company.size)}
          {this.renderRow('Industry', company.industry)}
          {this.renderRow('Plan', company.plan)}
          {this.renderRow(
            'Parent Company',
            company.parentCompany ? company.parentCompany.primaryName : '-'
          )}
          {this.renderRow('Email', company.email)}
          {this.renderRow(
            'Owner',
            company.owner ? company.owner.details.fullName : '-'
          )}
          {this.renderRow('Phone', company.phone)}
          {this.renderRow('Lead Status', leadStatusDisplay)}
          {this.renderRow('Lifecycle State', lifecycleStateDisplay)}
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
