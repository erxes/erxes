import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarContent,
  SidebarCounter,
  SidebarList
} from 'modules/layout/styles';
import { AvatarWrapper } from 'modules/activityLogs/styles';
import { Icon, NameCard, ModalTrigger } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { Links } from 'modules/settings/team/components/detail/styles';
import { CustomerForm } from '../../';
import { NameWrapper } from './styles';

const propTypes = {
  customer: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

class BasicInfo extends React.Component {
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
    const { customer, save } = this.props;
    const { links = {}, isUser } = customer;
    const { __ } = this.context;

    return (
      <Fragment>
        <SidebarContent>
          <NameWrapper>
            <AvatarWrapper isUser={isUser}>
              <NameCard.Avatar customer={customer} size={50} />
              {isUser ? <Icon icon="checkmark" /> : <Icon icon="minus" />}
            </AvatarWrapper>

            <div className="customer-name">
              {renderFullName(customer)}
              {this.renderLinks(links)}
            </div>

            <ModalTrigger title="Edit" trigger={<Icon icon="edit" />} size="lg">
              <CustomerForm action={save} customer={customer} />
            </ModalTrigger>
          </NameWrapper>
        </SidebarContent>

        <SidebarList className="no-link">
          <li>
            {__('Email')}:
            <SidebarCounter>
              {customer.email ||
                this.getVisitorInfo(customer, 'email') || (
                  <a onClick={this.toggleEditing}>{__('Add Email')}</a>
                )}
            </SidebarCounter>
          </li>

          <li>
            {__('Phone')}:
            <SidebarCounter>
              {customer.phone ||
                this.getVisitorInfo(customer, 'phone') || (
                  <a onClick={this.toggleEditing}>{__('Add Phone')}</a>
                )}
            </SidebarCounter>
          </li>

          <li>
            Owner :
            <SidebarCounter>
              {customer.owner ? customer.owner.details.fullName : '-'}
            </SidebarCounter>
          </li>

          <li>
            Position :
            <SidebarCounter>{customer.position || '-'}</SidebarCounter>
          </li>

          <li>
            Department :
            <SidebarCounter>{customer.department || '-'}</SidebarCounter>
          </li>

          <li>
            Lead status :
            <SidebarCounter>{customer.leadStatus || '-'}</SidebarCounter>
          </li>
          <li>
            Lifecycle State :
            <SidebarCounter>{customer.lifecycleState || '-'}</SidebarCounter>
          </li>

          <li>
            Has Authority :
            <SidebarCounter>{customer.hasAuthority || '-'}</SidebarCounter>
          </li>

          <li>
            Description :
            <SidebarCounter>{customer.description || '-'}</SidebarCounter>
          </li>

          <li>
            Do Not Disturb :
            <SidebarCounter>{customer.doNotDisturb || '-'}</SidebarCounter>
          </li>
        </SidebarList>
      </Fragment>
    );
  }

  render() {
    return <Sidebar.Section>{this.renderInfo()}</Sidebar.Section>;
  }
}

BasicInfo.propTypes = propTypes;
BasicInfo.contextTypes = {
  __: PropTypes.func
};

export default BasicInfo;
