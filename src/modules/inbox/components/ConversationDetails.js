import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

const propTypes = {
  conversation: PropTypes.object.isRequired
};

class ConversationDetails extends Component {
  renderFacebookPostUrl() {
    const conversation = this.props.conversation;
    const integration = conversation.integration || {};

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
              [view]
            </a>
          </SidebarCounter>
        </li>
      );
    }

    return null;
  }
  render() {
    const { Title } = Wrapper.Sidebar.Section;

    const { conversation = {} } = this.props;
    const { integration = {} } = conversation;
    const { brand = {}, channels = [] } = integration;

    return (
      <Wrapper.Sidebar.Section>
        <Title>Conversation Details</Title>
        <SidebarList className="no-link">
          <li>
            Opened
            <SidebarCounter>
              {moment(conversation.createdAt).format('lll')}
            </SidebarCounter>
          </li>
          <li>
            Channels
            <SidebarCounter>
              {channels.map(c => <span key={c._id}>{c.name}</span>)}
            </SidebarCounter>
          </li>
          <li>
            Brand
            <SidebarCounter>{brand && brand.name}</SidebarCounter>
          </li>
          <li>
            Integration
            <SidebarCounter>{integration.kind}</SidebarCounter>
          </li>
          <li>
            Conversations
            <SidebarCounter>{conversation.messageCount}</SidebarCounter>
          </li>
        </SidebarList>
      </Wrapper.Sidebar.Section>
    );
  }
}

ConversationDetails.propTypes = propTypes;

export default ConversationDetails;
