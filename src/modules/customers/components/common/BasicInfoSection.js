import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import {
  DropdownToggle,
  Button,
  Icon,
  NameCard,
  ModalTrigger
} from 'modules/common/components';
import { searchCustomer, renderFullName, confirm } from 'modules/common/utils';
import { Links, InfoWrapper } from 'modules/common/styles/main';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { AvatarWrapper } from 'modules/activityLogs/styles';
import { CustomerForm } from 'modules/customers/containers';
import { Action } from 'modules/customers/styles';
import { TargetMergeModal } from 'modules/customers/components';
import {
  CUSTOMER_BASIC_INFO,
  CUSTOMER_DATAS
} from 'modules/customers/constants';

const propTypes = {
  customer: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  merge: PropTypes.func.isRequired
};

class BasicInfo extends Component {
  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
  }

  getVisitorInfo(customer, key) {
    return customer.visitorContactInfo && customer.visitorContactInfo[key];
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
    const { remove, merge, customer } = this.props;

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
                object={customer}
                searchObject={searchCustomer}
                basicInfos={Object.assign(
                  {},
                  CUSTOMER_BASIC_INFO,
                  CUSTOMER_DATAS
                )}
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
    const { customer } = this.props;
    const { links = {}, isUser } = customer;

    return (
      <Fragment>
        <InfoWrapper>
          <AvatarWrapper isUser={isUser}>
            <NameCard.Avatar customer={customer} size={50} />
            {isUser ? <Icon icon="check" /> : <Icon icon="minus" />}
          </AvatarWrapper>

          <div className="name">
            {renderFullName(customer)}
            {this.renderLinks(links)}
          </div>

          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="lg"
          >
            <CustomerForm size="lg" customer={customer} />
          </ModalTrigger>
        </InfoWrapper>

        {this.renderAction()}

        <SidebarList className="no-link">
          {this.renderRow(
            'Email',
            customer.primaryEmail ||
              this.getVisitorInfo(customer, 'email') ||
              ''
          )}
          {this.renderRow(
            'Phone',
            customer.primaryPhone ||
              this.getVisitorInfo(customer, 'phone') ||
              ''
          )}

          {this.renderRow(
            'Owner',
            customer.owner ? customer.owner.details.fullName : ''
          )}

          {this.renderRow('Position', customer.position)}
          {this.renderRow('Department', customer.department)}
          {this.renderRow('Lead Status', customer.leadStatus)}
          {this.renderRow('Lifecycle State', customer.lifecycleState)}
          {this.renderRow('Has Authority', customer.hasAuthority)}
          {this.renderRow('Description', customer.description)}
          {this.renderRow('Do not disturb', customer.doNotDisturb)}
        </SidebarList>
      </Fragment>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { __ } = this.context;

    return (
      <Section>
        <Title>{__('Profile')}</Title>

        {this.renderInfo()}
      </Section>
    );
  }
}

BasicInfo.propTypes = propTypes;
BasicInfo.contextTypes = {
  __: PropTypes.func
};

export default BasicInfo;
