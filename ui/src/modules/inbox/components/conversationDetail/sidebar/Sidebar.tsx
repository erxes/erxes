import { Tabs, TabTitle } from 'modules/common/components/tabs';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import { BasicInfo, TabContent } from './styles';

import { IUser } from 'modules/auth/types';
import asyncComponent from 'modules/common/components/AsyncComponent';
import Box from 'modules/common/components/Box';
import { __ } from 'modules/common/utils';
import CompanySection from 'modules/companies/components/common/CompanySection';
import WebsiteActivity from 'modules/customers/components/common/WebsiteActivity';
import { ICustomer } from 'modules/customers/types';
import { IConversation } from '../../../types';

const ActionSection = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar-ActionSection" */ 'modules/customers/containers/common/ActionSection')
);

const CustomFieldsSection = asyncComponent(
  () =>
    import(/* webpackChunkName:"Inbox-Sidebar-CustomFieldsSection" */ 'modules/customers/containers/common/CustomFieldsSection'),
  { height: '200px', width: '100%', color: '#fff' }
);

const PortableDeals = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar-PortableDeals" */ 'modules/deals/components/PortableDeals')
);

const PortableTasks = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar-PortableTasks" */ 'modules/tasks/components/PortableTasks')
);

const PortableTickets = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar-PortableTickets" */ 'modules/tickets/components/PortableTickets')
);

const Contacts = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar-Contacts" */ 'modules/companies/components/detail/Contacts')
);

const DetailInfo = asyncComponent(
  () =>
    import(/* webpackChunkName:"Inbox-Sidebar-InfoSection" */ 'modules/customers/components/common/DetailInfo'),
  { isBox: true }
);

const InfoSection = asyncComponent(
  () =>
    import(/* webpackChunkName:"Inbox-Sidebar-InfoSection" */ 'modules/customers/components/common/InfoSection'),
  { withImage: true }
);

const DevicePropertiesSection = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar-DevicePropertiesSection" */ 'modules/customers/components/common/DevicePropertiesSection')
);

const TrackedDataSection = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar-TrackedDataSection" */ 'modules/customers/components/common/TrackedDataSection')
);

const TaggerSection = asyncComponent(
  () =>
    import(/* webpackChunkName:"Inbox-Sidebar-TaggerSection" */ 'modules/customers/components/common/TaggerSection'),
  { height: '200px', width: '100%', color: '#fff' }
);

const SidebarActivity = asyncComponent(() =>
  import(/* webpackChunkName:"Inbox-Sidebar-SidebarActivity" */ 'modules/inbox/containers/conversationDetail/SidebarActivity')
);

const ConversationDetails = asyncComponent(
  () =>
    import(/* webpackChunkName:"Inbox-Sidebar-ConversationDetails" */ './ConversationDetails'),
  { isBox: true }
);

type IndexProps = {
  currentUser: IUser;
  conversation: IConversation;
  customer: ICustomer;
  loading: boolean;
  toggleSection: () => void;
  taggerRefetchQueries: any;
  merge?: (doc: { ids: string[]; data: ICustomer }) => void;
};

type IndexState = {
  currentTab: string;
  currentSubTab: string;
};

interface IRenderData {
  customer: ICustomer;
  kind: string;
  toggleSection: () => void;
}

class Index extends React.Component<IndexProps, IndexState> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'customer',
      currentSubTab: 'details'
    };
  }

  onTabClick = currentTab => {
    this.setState({ currentTab });
  };

  onSubtabClick = currentSubTab => {
    this.setState({ currentSubTab });
  };

  renderTrackedData = ({ customer, kind, toggleSection }: IRenderData) => {
    return (
      <TrackedDataSection
        customer={customer}
        collapseCallback={toggleSection}
      />
    );
  };

  renderDeviceProperties = ({ customer, kind, toggleSection }: IRenderData) => {
    if (!(kind === 'messenger' || kind === 'form')) {
      return null;
    }
    return (
      <DevicePropertiesSection
        customer={customer}
        collapseCallback={toggleSection}
      />
    );
  };

  renderTabSubContent() {
    const { currentSubTab } = this.state;

    const {
      currentUser,
      taggerRefetchQueries,
      conversation,
      customer,
      toggleSection,
      loading
    } = this.props;

    const { kind = '' } = customer.integration || {};

    if (currentSubTab === 'details') {
      return (
        <TabContent>
          <DetailInfo customer={customer} />
          <Box
            title={__('Conversation details')}
            name="showConversationDetails"
            callback={toggleSection}
          >
            <ConversationDetails conversation={conversation} />
          </Box>
          <TaggerSection
            data={customer}
            type="customer"
            refetchQueries={taggerRefetchQueries}
            collapseCallback={toggleSection}
          />
          <CustomFieldsSection loading={loading} customer={customer} />
          {this.renderTrackedData({ customer, kind, toggleSection })}
          {this.renderDeviceProperties({ customer, kind, toggleSection })}
          <WebsiteActivity urlVisits={customer.urlVisits || []} />
        </TabContent>
      );
    }

    if (currentSubTab === 'activity') {
      return (
        <SidebarActivity
          currentUser={currentUser}
          customer={customer}
          currentSubTab={currentSubTab}
        />
      );
    }

    return (
      <>
        <PortableDeals mainType="customer" mainTypeId={customer._id} />
        <PortableTickets mainType="customer" mainTypeId={customer._id} />
        <PortableTasks mainType="customer" mainTypeId={customer._id} />
      </>
    );
  }

  renderTabContent() {
    const { currentTab, currentSubTab } = this.state;
    const { customer, toggleSection } = this.props;

    if (currentTab === 'customer') {
      const detailsOnClick = () => this.onSubtabClick('details');
      const activityOnClick = () => this.onSubtabClick('activity');
      const relatedOnClick = () => this.onSubtabClick('related');

      return (
        <>
          <BasicInfo>
            <InfoSection customer={customer} hideForm={true} />
          </BasicInfo>
          <ActionSection customer={customer} />
          <Tabs full={true}>
            <TabTitle
              className={currentSubTab === 'details' ? 'active' : ''}
              onClick={detailsOnClick}
            >
              {__('Details')}
            </TabTitle>
            <TabTitle
              className={currentSubTab === 'activity' ? 'active' : ''}
              onClick={activityOnClick}
            >
              {__('Activity')}
            </TabTitle>
            <TabTitle
              className={currentSubTab === 'related' ? 'active' : ''}
              onClick={relatedOnClick}
            >
              {__('Related')}
            </TabTitle>
          </Tabs>
          {this.renderTabSubContent()}
        </>
      );
    }

    return (
      <>
        <CompanySection
          mainType="customer"
          mainTypeId={customer._id}
          collapseCallback={toggleSection}
        />
        <Contacts companies={customer.companies} customerId={customer._id} />
      </>
    );
  }

  render() {
    const { currentTab } = this.state;
    const customerOnClick = () => this.onTabClick('customer');
    const companyOnClick = () => this.onTabClick('company');

    return (
      <Sidebar full={true}>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'customer' ? 'active' : ''}
            onClick={customerOnClick}
          >
            {__('Customer')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'company' ? 'active' : ''}
            onClick={companyOnClick}
          >
            {__('Company')}
          </TabTitle>
        </Tabs>
        {this.renderTabContent()}
      </Sidebar>
    );
  }
}

export default Index;
