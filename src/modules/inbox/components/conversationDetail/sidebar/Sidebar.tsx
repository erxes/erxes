import {
  Button as CButton,
  DataWithLoader,
  DropdownToggle,
  Icon,
  ModalTrigger,
  NameCard,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { CompanyAssociate } from 'modules/companies/containers';
import {
  DevicePropertiesSection,
  MessengerSection,
  TaggerSection
} from 'modules/customers/components/common';
import { CustomFieldsSection } from 'modules/customers/containers/common';
import { PortableDeals } from 'modules/deals/containers';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarCounter,
  SidebarFlexRow,
  SidebarList,
  SidebarToggle
} from 'modules/layout/styles';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Actions, Name, SectionContainer } from './styles';

import { ActivityList } from 'modules/activityLogs/components';
import { AvatarWrapper } from 'modules/activityLogs/styles';
import { IUser } from 'modules/auth/types';
import {
  ActivityContent,
  InfoWrapper,
  Links
} from 'modules/common/styles/main';
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
import { ICustomer } from 'modules/customers/types';
import { hasAnyActivity } from 'modules/customers/utils';
import { Button } from '../../../../deals/styles/deal';
import { IConversation } from '../../../types';
import ConversationDetails from './ConversationDetails';

type BoxProps = {
  title: string;
  name: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggle: (params: { name: string; isOpen: boolean }) => void;
};

type BoxState = {
  isOpen: boolean;
};

class Box extends React.Component<BoxProps, BoxState> {
  constructor(props: BoxProps) {
    super(props);

    this.state = {
      isOpen: props.isOpen
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { name, toggle } = this.props;
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });

    toggle({ name, isOpen: !isOpen });
  }

  renderDropBtn() {
    const icon = this.state.isOpen ? 'uparrow-2' : 'downarrow';

    return (
      <SidebarToggle inverse={!this.state.isOpen} onClick={this.toggle}>
        <Icon icon={icon} />
      </SidebarToggle>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { isOpen } = this.state;
    const { children, title } = this.props;

    if (!isOpen) {
      return (
        <SectionContainer>
          <Title>{title}</Title>
          {this.renderDropBtn()}
        </SectionContainer>
      );
    }

    return (
      <SectionContainer>
        {children}
        {this.renderDropBtn()}
      </SectionContainer>
    );
  }
}

type IndexProps = {
  conversation: IConversation;
  customer: ICustomer;
  toggleSection: (params: { name: string; isOpen: boolean }) => void;
  config: { [key: string]: boolean };
  taggerRefetchQueries: any;
  merge?: (doc: { ids: string[]; data: ICustomer }) => void;
  activityLogsCustomer: any[];
  loadingLogs: boolean;
  currentUser: IUser;
};

type IndexState = {
  currentTab: string;
  currentSubTab: string;
};

interface IRenderData {
  customer: ICustomer;
  kind: string;
  config: { [key: string]: boolean };
  toggleSection: (params: { name: string; isOpen: boolean }) => void;
}

class Index extends React.Component<IndexProps, IndexState> {
  constructor(props) {
    super(props);

    this.state = { currentTab: 'customer', currentSubTab: 'details' };

    this.onTabClick = this.onTabClick.bind(this);
    this.onSubtabClick = this.onSubtabClick.bind(this);
  }

  onTabClick(currentTab) {
    this.setState({ currentTab });
  }

  onSubtabClick(currentSubTab) {
    this.setState({ currentSubTab });
  }

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

  renderMessengerData({ customer, kind, config, toggleSection }: IRenderData) {
    if (kind !== 'messenger') {
      return null;
    }

    return (
      <Box
        title={__('Messenger data') as string}
        name="showMessengerData"
        isOpen={config.showMessengerData || false}
        toggle={toggleSection}
      >
        <MessengerSection customer={customer} />
      </Box>
    );
  }

  renderDeviceProperties({
    customer,
    kind,
    config,
    toggleSection
  }: IRenderData) {
    if (!(kind === 'messenger' || kind === 'form')) {
      return null;
    }

    return (
      <Box
        title={__('Device properties') as string}
        name="showDeviceProperties"
        isOpen={config.showDeviceProperties || false}
        toggle={toggleSection}
      >
        <DevicePropertiesSection customer={customer} />
      </Box>
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

  renderActions() {
    const { customer, merge } = this.props;

    return (
      <Actions>
        <a href={`mailto:${customer.primaryEmail}`}>
          <CButton size="small">{__('Email')}</CButton>
        </a>
        <a href={`sms:${customer.primaryPhone}`}>
          <CButton size="small">{__('Sms')}</CButton>
        </a>
        <a href={`tel:${customer.primaryPhone}`}>
          <CButton size="small">{__('Call')}</CButton>
        </a>
        <Dropdown id="dropdown-engage">
          <DropdownToggle bsRole="toggle">
            <CButton size="small">
              {__('Action')} <Icon icon="downarrow" />
            </CButton>
          </DropdownToggle>
          <Dropdown.Menu>
            <li>
              {/* <TargetMerge
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
              /> */}
            </li>
            <li>
              {/* <a onClick={() => confirm().then(() => remove())}> */}
              <a>{__('Delete')}</a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Actions>
    );
  }

  renderTabSubContent() {
    const { currentSubTab } = this.state;
    const {
      taggerRefetchQueries,
      activityLogsCustomer,
      loadingLogs,
      conversation,
      customer,
      toggleSection,
      config,
      currentUser
    } = this.props;
    const { kind = '' } = customer.integration || {};
    const hasActivity = hasAnyActivity(activityLogsCustomer);

    if (currentSubTab === 'details') {
      return (
        <React.Fragment>
          <SidebarList className="no-link">
            {this.renderRow(
              'Owner',
              customer.owner && customer.owner.details
                ? customer.owner.details.fullName
                : ''
            )}
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

          <Box
            title={__('Conversation details')}
            name="showConversationDetails"
            isOpen={config.showConversationDetails || false}
            toggle={toggleSection}
          >
            <ConversationDetails conversation={conversation} />
          </Box>

          <Box
            title={__('Tags')}
            name="showTags"
            isOpen={config.showTags || false}
            toggle={toggleSection}
          >
            <TaggerSection
              data={customer}
              type="customer"
              refetchQueries={taggerRefetchQueries}
            />
          </Box>

          <Box
            title={__('Contact information')}
            name="showCustomFields"
            isOpen={config.showCustomFields || false}
            toggle={toggleSection}
          >
            <CustomFieldsSection customer={customer} />
          </Box>

          {this.renderMessengerData({
            customer,
            kind,
            config,
            toggleSection
          })}
          {this.renderDeviceProperties({
            customer,
            kind,
            config,
            toggleSection
          })}
        </React.Fragment>
      );
    }

    if (currentSubTab === 'related') {
      return (
        <React.Fragment>
          <Box
            title={__('Deals')}
            name="showDeals"
            isOpen={config.showDeals || false}
            toggle={toggleSection}
          >
            <PortableDeals customerId={customer._id} />
          </Box>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <NoteForm contentType="customer" contentTypeId={customer._id} />

        <ActivityContent isEmpty={!hasActivity}>
          <DataWithLoader
            loading={loadingLogs}
            count={!loadingLogs && hasActivity ? 1 : 0}
            data={
              <ActivityList
                user={currentUser}
                activities={activityLogsCustomer}
                target={customer.firstName}
                type={currentSubTab} // show logs filtered by type
              />
            }
            emptyText="No Activities"
            emptyImage="/images/robots/robot-03.svg"
          />
        </ActivityContent>
      </React.Fragment>
    );
  }

  renderTabContent() {
    const { currentTab, currentSubTab } = this.state;
    const { customer } = this.props;
    const { links = {}, isUser } = customer;

    if (currentTab === 'customer') {
      return (
        <React.Fragment>
          <InfoWrapper>
            <AvatarWrapper isUser={isUser}>
              <NameCard.Avatar customer={customer} size={50} />
              {isUser ? <Icon icon="check" /> : <Icon icon="minus" />}
              <div>{isUser ? 'User' : 'Visitor'}</div>
            </AvatarWrapper>

            <Name>
              {renderFullName(customer)}
              <p>{customer.position}</p>
              {this.renderLinks(links)}
            </Name>

            <ModalTrigger
              title="Edit basic info"
              trigger={<Icon icon="edit" />}
              size="lg"
              content={props => (
                <CustomerForm {...props} size="lg" customer={customer} />
              )}
            />
          </InfoWrapper>

          {this.renderActions()}

          <Tabs full>
            <TabTitle
              className={currentSubTab === 'details' ? 'active' : ''}
              onClick={() => this.onSubtabClick('details')}
            >
              {__('Details')}
            </TabTitle>
            <TabTitle
              className={currentSubTab === 'activity' ? 'active' : ''}
              onClick={() => this.onSubtabClick('activity')}
            >
              {__('Activity')}
            </TabTitle>
            <TabTitle
              className={currentSubTab === 'related' ? 'active' : ''}
              onClick={() => this.onSubtabClick('related')}
            >
              {__('Related')}
            </TabTitle>
          </Tabs>
          {this.renderTabSubContent()}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <CompanyAssociate data={customer} />
      </React.Fragment>
    );
  }

  render() {
    const { currentTab } = this.state;

    return (
      <Sidebar full>
        <Tabs full>
          <TabTitle
            className={currentTab === 'customer' ? 'active' : ''}
            onClick={() => this.onTabClick('customer')}
          >
            {__('CUSTOMER')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'company' ? 'active' : ''}
            onClick={() => this.onTabClick('company')}
          >
            {__('COMPANY')}
          </TabTitle>
        </Tabs>
        {this.renderTabContent()}
      </Sidebar>
    );
  }
}

export default Index;
