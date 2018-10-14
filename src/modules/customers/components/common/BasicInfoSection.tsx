import { AvatarWrapper } from 'modules/activityLogs/styles';
import {
  Button,
  DropdownToggle,
  Icon,
  ModalTrigger,
  NameCard
} from 'modules/common/components';
import { InfoWrapper, Links } from 'modules/common/styles/main';
import {
  __,
  confirm,
  renderFullName,
  searchCustomer
} from 'modules/common/utils';
import { CustomersMerge, TargetMerge } from 'modules/customers/components';
import {
  LEAD_STATUS_TYPES,
  LIFECYCLE_STATE_TYPES
} from 'modules/customers/constants';
import { CustomerForm } from 'modules/customers/containers';
import { Action } from 'modules/customers/styles';
import { ICustomer } from 'modules/customers/types';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from 'modules/layout/styles';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';

type Props = {
  customer: ICustomer;
  remove: () => void;
  merge: (doc: { ids: string[]; data: ICustomer }) => void;
};

class BasicInfo extends React.Component<Props> {
  renderLink(value, icon) {
    let link = value;

    if (!value) {
      return null;
    }

    if (!value.includes('http')) {
      link = 'https://'.concat(value);
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
        {__(`${label}`)}:
        <SidebarCounter fullLength={label === 'Description'}>
          {value || '-'}
        </SidebarCounter>
      </li>
    );
  }

  renderAction() {
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
              <TargetMerge
                onSave={merge}
                object={customer}
                searchObject={searchCustomer}
                mergeForm={CustomersMerge}
                generateOptions={customers => {
                  return customers.map((cus, key) => ({
                    key,
                    value: JSON.stringify(cus),
                    label:
                      cus.firstName ||
                      cus.lastName ||
                      cus.primaryEmail ||
                      cus.primaryPhone ||
                      'N/A'
                  }));
                }}
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
    const avatar = customer.avatar !== null ? true : false;

    return (
      <React.Fragment>
        <InfoWrapper>
          <AvatarWrapper isUser={isUser}>
            <NameCard.Avatar customer={customer} size={50} isAvatar={avatar} />
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
            content={props => (
              <CustomerForm {...props} size="lg" customer={customer} />
            )}
          />
        </InfoWrapper>

        {this.renderAction()}

        <SidebarList className="no-link">
          {this.renderRow('Primary email', customer.primaryEmail)}
          {this.renderRow('Primary phone', customer.primaryPhone)}

          {this.renderRow(
            'Owner',
            customer.owner && customer.owner.details
              ? customer.owner.details.fullName
              : ''
          )}

          {this.renderRow('Position', customer.position)}
          {this.renderRow('Department', customer.department)}
          {this.renderRow(
            'Lead Status',
            LEAD_STATUS_TYPES[customer.leadStatus || '']
          )}
          {this.renderRow(
            'Lifecycle State',
            LIFECYCLE_STATE_TYPES[customer.lifecycleState || '']
          )}
          {this.renderRow('Has Authority', customer.hasAuthority)}
          {this.renderRow('Do not disturb', customer.doNotDisturb)}
          <SidebarFlexRow>
            {__(`Description`)}:<span>{customer.description || '-'}</span>
          </SidebarFlexRow>
        </SidebarList>
      </React.Fragment>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section>
        <Title>{__('Profile')}</Title>

        {this.renderInfo()}
      </Section>
    );
  }
}

export default BasicInfo;
