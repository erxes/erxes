import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { IntegrationIcon } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarList,
  SidebarCounter,
  SectionBody
} from 'modules/layout/styles';

const propTypes = {
  conversation: PropTypes.object.isRequired
};

class ConversationDetails extends Component {
  renderVisitorContactInfo(customer, __) {
    const { visitorContactInfo } = customer;

    if (!visitorContactInfo) {
      return null;
    }

    return (
      <li>
        {__('Visitor contact info')}
        <SidebarCounter>
          {visitorContactInfo.email || visitorContactInfo.phone}
        </SidebarCounter>
      </li>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { __ } = this.context;

    const { conversation = {} } = this.props;
    const { integration = {}, customer } = conversation;
    const { brand = {}, channels = [] } = integration;

    return (
      <Section>
        <Title>{__('Conversation Details')}</Title>

        <SectionBody>
          <SidebarList className="no-link">
            {this.renderVisitorContactInfo(customer, __)}
            <li>
              {__('Opened')}
              <SidebarCounter>
                {moment(conversation.createdAt).format('lll')}
              </SidebarCounter>
            </li>
            <li>
              {__('Channels')}
              <SidebarCounter>
                {channels.map(c => <span key={c._id}>{c.name} </span>)}
              </SidebarCounter>
            </li>
            <li>
              {__('Brand')}
              <SidebarCounter>{brand && brand.name}</SidebarCounter>
            </li>
            <li>
              {__('Integration')}
              <SidebarCounter>
                {integration.kind}
                <IntegrationIcon
                  integration={integration}
                  customer={conversation.customer}
                  facebookData={conversation.facebookData}
                  twitterData={conversation.twitterData}
                />
              </SidebarCounter>
            </li>
            <li>
              {__('Conversations')}
              <SidebarCounter>{conversation.messageCount}</SidebarCounter>
            </li>
          </SidebarList>
        </SectionBody>
      </Section>
    );
  }
}

ConversationDetails.propTypes = propTypes;
ConversationDetails.contextTypes = {
  __: PropTypes.func
};

export default ConversationDetails;
