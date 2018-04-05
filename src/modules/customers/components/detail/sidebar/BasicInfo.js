import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { AvatarWrapper } from 'modules/activityLogs/styles';
import { Icon, NameCard, ModalTrigger } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { Links, InfoWrapper } from 'modules/common/styles/styles';
import { CustomerForm } from 'modules/customers/containers';

const propTypes = {
  customer: PropTypes.object.isRequired
};

class BasicInfo extends React.Component {
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
    const { customer } = this.props;
    const { links = {}, isUser } = customer;

    return (
      <Fragment>
        <InfoWrapper>
          <AvatarWrapper isUser={isUser}>
            <NameCard.Avatar customer={customer} size={50} />
            {isUser ? <Icon icon="checkmark" /> : <Icon icon="minus" />}
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

        <SidebarList className="no-link">
          {this.renderRow(
            'Email',
            customer.email || this.getVisitorInfo(customer, 'email') || '-'
          )}
          {this.renderRow(
            'Phone',
            customer.phone || this.getVisitorInfo(customer, 'phone') || '-'
          )}

          {this.renderRow(
            'Owner',
            customer.owner ? customer.owner.details.fullName : '-'
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
    return <Sidebar.Section>{this.renderInfo()}</Sidebar.Section>;
  }
}

BasicInfo.propTypes = propTypes;
BasicInfo.contextTypes = {
  __: PropTypes.func
};

export default BasicInfo;
