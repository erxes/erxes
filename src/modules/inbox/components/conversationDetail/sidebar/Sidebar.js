import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'modules/common/components';
import { CompanyAssociate } from 'modules/companies/containers';
import { PortableDeals } from 'modules/deals/containers';
import { Sidebar } from 'modules/layout/components';
import { SidebarToggle } from 'modules/layout/styles';
import { SectionContainer } from './styles';
import {
  MessengerSection,
  DevicePropertiesSection,
  TaggerSection
} from 'modules/customers/components/common';

import {
  BasicInfoSection,
  CustomFieldsSection
} from 'modules/customers/containers/common';

import ConversationDetails from './ConversationDetails';

class Box extends Component {
  constructor(props, context) {
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

Box.propTypes = {
  title: PropTypes.string,
  name: PropTypes.string,
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  toggle: PropTypes.func
};

class Index extends Component {
  renderMessengerData({ customer, kind, __, config, toggleSection }) {
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
  }

  renderDeviceProperties({ customer, kind, __, config, toggleSection }) {
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
  }

  render() {
    const { conversation, customer, toggleSection, config } = this.props;
    const { kind } = customer.integration || {};
    const { __ } = this.context;

    return (
      <Sidebar>
        <Box
          title={__('Profile')}
          name="showProfile"
          isOpen={config.showProfile || false}
          toggle={toggleSection}
        >
          <BasicInfoSection customer={customer} />
        </Box>

        <Box
          title={__('Conversation details')}
          name="showConversationDetails"
          isOpen={config.showConversationDetails || false}
          toggle={toggleSection}
        >
          <ConversationDetails conversation={conversation} />
        </Box>

        {this.renderMessengerData({
          customer,
          kind,
          __,
          config,
          toggleSection
        })}
        {this.renderDeviceProperties({
          customer,
          kind,
          __,
          config,
          toggleSection
        })}

        <Box
          title={__('Contact information')}
          name="showCustomFields"
          isOpen={config.showCustomFields || false}
          toggle={toggleSection}
        >
          <CustomFieldsSection customer={customer} />
        </Box>

        <Box
          title={__('Tags')}
          name="showTags"
          isOpen={config.showTags || false}
          toggle={toggleSection}
        >
          <TaggerSection data={customer} type="customer" />
        </Box>

        <Box
          title={__('Companies')}
          name="showCompanies"
          isOpen={config.showCompanies || false}
          toggle={toggleSection}
        >
          <CompanyAssociate data={customer} />
        </Box>

        <Box
          title={__('Deals')}
          name="showDeals"
          isOpen={config.showDeals || false}
          toggle={toggleSection}
        >
          <PortableDeals customerId={customer._id} />
        </Box>
      </Sidebar>
    );
  }
}

Index.propTypes = {
  conversation: PropTypes.object,
  customer: PropTypes.object,
  toggleSection: PropTypes.func,
  config: PropTypes.object
};

Index.contextTypes = {
  __: PropTypes.func
};

export default Index;
