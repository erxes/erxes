import {
  Button,
  Icon,
  ModalTrigger,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { CompanyAssociate } from 'modules/companies/containers';
import {
  DetailInfo,
  DevicePropertiesSection,
  InfoSection,
  MessengerSection,
  TaggerSection
} from 'modules/customers/components/common';
import { ActionSection } from 'modules/customers/containers/common';
import { CustomFieldsSection } from 'modules/customers/containers/common';
import { PortableDeals } from 'modules/deals/containers';
import { Sidebar } from 'modules/layout/components';
import * as React from 'react';
import {
  Actions,
  BasicInfo,
  SectionContainer,
  SidebarCollapse
} from './styles';

import { __ } from 'modules/common/utils';
import { Contacts } from 'modules/companies/components';
import { ICustomer } from 'modules/customers/types';
import { SidebarActivity } from 'modules/inbox/containers/conversationDetail';
import { MailForm } from 'modules/settings/integrations/containers/google';
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
  }

  toggle = () => {
    const { name, toggle } = this.props;
    const { isOpen } = this.state;

    this.setState({ isOpen: !isOpen });

    toggle({ name, isOpen: !isOpen });
  };

  renderDropBtn() {
    const icon = this.state.isOpen ? 'downarrow' : 'rightarrow-2';

    return (
      <SidebarCollapse onClick={this.toggle}>
        <Icon icon={icon} />
      </SidebarCollapse>
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
  loading: boolean;
  toggleSection: (params: { name: string; isOpen: boolean }) => void;
  config: { [key: string]: boolean };
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
  config: { [key: string]: boolean };
  toggleSection: (params: { name: string; isOpen: boolean }) => void;
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

  renderMessengerData = ({
    customer,
    kind,
    config,
    toggleSection
  }: IRenderData) => {
    if (kind !== 'messenger') {
      return null;
    }

    return (
      <Box
        title={__('Messenger data')}
        name="showMessengerData"
        isOpen={config.showMessengerData || false}
        toggle={toggleSection}
      >
        <MessengerSection customer={customer} />
      </Box>
    );
  };

  renderDeviceProperties = ({
    customer,
    kind,
    config,
    toggleSection
  }: IRenderData) => {
    if (!(kind === 'messenger' || kind === 'form')) {
      return null;
    }

    return (
      <Box
        title={__('Device properties')}
        name="showDeviceProperties"
        isOpen={config.showDeviceProperties || false}
        toggle={toggleSection}
      >
        <DevicePropertiesSection customer={customer} />
      </Box>
    );
  };

  renderActions() {
    const { customer } = this.props;
    const { primaryPhone, primaryEmail } = customer;

    const content = props => (
      <MailForm
        contentType="customer"
        contentTypeId={customer._id}
        toEmail={primaryEmail}
        refetchQueries={['activityLogsCustomer']}
        closeModal={props.closeModal}
      />
    );

    return (
      <Actions>
        <ModalTrigger
          title="Email"
          trigger={
            <Button disabled={primaryEmail ? false : true} size="small">
              {__('Email')}
            </Button>
          }
          size="lg"
          content={content}
        />
        <Button
          href={primaryPhone && `tel:${primaryPhone}`}
          size="small"
          disabled={primaryPhone ? false : true}
        >
          {__('Call')}
        </Button>
        <ActionSection customer={customer} isSmall={true} />
      </Actions>
    );
  }

  renderTabSubContent() {
    const { currentSubTab } = this.state;

    const {
      taggerRefetchQueries,
      conversation,
      customer,
      toggleSection,
      loading,
      config
    } = this.props;

    const { kind = '' } = customer.integration || {};

    if (currentSubTab === 'details') {
      return (
        <React.Fragment>
          <DetailInfo customer={customer} /> <br />
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
              isOpen={config.showTags}
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
            <CustomFieldsSection loading={loading} customer={customer} />
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

    if (currentSubTab === 'activity') {
      return (
        <SidebarActivity customer={customer} currentSubTab={currentSubTab} />
      );
    }

    return (
      <React.Fragment>
        <Box
          title={__('Deals')}
          name="showDeals"
          isOpen={config.showDeals || false}
          toggle={toggleSection}
        >
          <PortableDeals customerId={customer._id} isOpen={config.showDeals} />
        </Box>
      </React.Fragment>
    );
  }

  renderTabContent() {
    const { currentTab, currentSubTab } = this.state;
    const { customer, config, toggleSection } = this.props;

    if (currentTab === 'customer') {
      const detailsOnClick = () => this.onSubtabClick('details');
      const activityOnClick = () => this.onSubtabClick('activity');
      const relatedOnClick = () => this.onSubtabClick('related');

      return (
        <React.Fragment>
          <BasicInfo>
            <InfoSection
              customer={customer}
              showUserStatus={true}
              showUserPosition={true}
            />
          </BasicInfo>
          {this.renderActions()}

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
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Box
          title={__('Companies')}
          name="showCompanies"
          isOpen={config.showCompanies || false}
          toggle={toggleSection}
        >
          <CompanyAssociate isOpen={config.showCompanies} data={customer} />
        </Box>

        <Box
          title={__('Contacts')}
          name="showContacts"
          isOpen={config.showContacts || false}
          toggle={toggleSection}
        >
          <Contacts companies={customer.companies} customerId={customer._id} />
        </Box>
      </React.Fragment>
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
            {__('CUSTOMER')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'company' ? 'active' : ''}
            onClick={companyOnClick}
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
