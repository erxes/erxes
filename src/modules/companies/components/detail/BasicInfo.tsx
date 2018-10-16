import { AvatarWrapper } from 'modules/activityLogs/styles';
import {
  Button,
  DropdownToggle,
  Icon,
  ModalTrigger,
  NameCard
} from 'modules/common/components';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import { __, confirm, searchCompany } from 'modules/common/utils';
import { TargetMerge } from 'modules/customers/components';
import {
  LEAD_STATUS_TYPES,
  LIFECYCLE_STATE_TYPES
} from 'modules/customers/constants';
import { Action } from 'modules/customers/styles';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from 'modules/layout/styles';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { CompaniesMerge } from '..';
import { CompanyForm } from '../../containers';
import { ICompany } from '../../types';

type Props = {
  company: ICompany;
  remove: () => void;
  merge: (params: { ids: string[]; data: any }) => void;
};

class BasicInfo extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
  }

  renderLink(value, icon) {
    let link = value;

    if (!value) {
      return null;
    }

    if (!value.includes('http')) {
      link = 'http://'.concat(value);
    }

    return (
      <a href={link} target="_blank">
        <Icon icon={icon} />
      </a>
    );
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
    return (
      <li>
        {__(`${label}`)}:<SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  }

  targetMergeOptions(companies) {
    return companies.map((c, key) => ({
      key,
      value: JSON.stringify(c),
      label: c.primaryName || c.website || 'N/A'
    }));
  }

  renderAction() {
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
              <TargetMerge
                onSave={merge}
                object={company}
                searchObject={searchCompany}
                mergeForm={CompaniesMerge}
                generateOptions={this.targetMergeOptions}
              />
            </li>
            <li>
              <a onClick={confirm.bind(null).then(() => remove())}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Action>
    );
  }

  renderCompanyForm(props, company) {
    return <CompanyForm {...props} company={company} />;
  }

  renderInfo() {
    const { company } = this.props;
    const { links = {} } = company;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <AvatarWrapper>
            <NameCard.Avatar company={company} size={50} />
          </AvatarWrapper>

          <div className="name">
            {company.primaryName}
            {this.renderLinks(links)}
          </div>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="lg"
            content={this.renderCompanyForm.bind(this, company)}
          />
        </InfoWrapper>

        {this.renderAction()}

        <SidebarList className="no-link">
          {this.renderRow('Size', company.size)}
          {this.renderRow('Industry', company.industry)}
          {this.renderRow(
            'Parent Company',
            company.parentCompany ? company.parentCompany.primaryName : '-'
          )}
          {this.renderRow('Email', company.primaryEmail)}
          {this.renderRow(
            'Owner',
            company.owner && company.owner.details
              ? company.owner.details.fullName
              : '-'
          )}
          {this.renderRow('Phone', company.primaryPhone)}
          {this.renderRow(
            'Lead Status',
            LEAD_STATUS_TYPES[company.leadStatus || '']
          )}
          {this.renderRow(
            'Lifecycle State',
            LIFECYCLE_STATE_TYPES[company.lifecycleState || '']
          )}
          {this.renderRow('Business Type', company.businessType)}
          {this.renderRow('Do not disturb', company.doNotDisturb)}
          <SidebarFlexRow>
            {__(`Description`)}:<span>{company.description || '-'}</span>
          </SidebarFlexRow>
        </SidebarList>
      </Sidebar.Section>
    );
  }

  render() {
    return this.renderInfo();
  }
}

export default BasicInfo;
