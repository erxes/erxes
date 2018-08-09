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
  renderFacebookPostUrl() {
    const conversation = this.props.conversation;
    const integration = conversation.integration || {};
    const { __ } = this.context;

    if (
      integration.kind === 'facebook' &&
      conversation.facebookData.kind === 'feed'
    ) {
      const link = `http://facebook.com/${conversation.facebookData.postId}`;
      return (
        <li>
          Facebook URL
          <SidebarCounter>
            <a target="_blank" href={link} rel="noopener noreferrer">
              {__('[view]')}
            </a>
          </SidebarCounter>
        </li>
      );
    }

    return null;
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { __ } = this.context;

    const { conversation = {} } = this.props;
    const { integration = {} } = conversation;
    const { brand = {}, channels = [] } = integration;

    return (
      <Section>
        <Title>{__('Conversation Details')}</Title>

        <SectionBody>
          <SidebarList className="no-link">
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
