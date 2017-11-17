import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import {
  AvatarWrapper,
  ActivityRow,
  ActivityWrapper,
  ActivityCaption,
  IconWrapper
} from 'modules/activityLogs/styles';
import { Tip, Icon, NameCard } from 'modules/common/components';
import {
  MessengerSection,
  TwitterSection,
  FacebookSection
} from 'modules/customers/components/detail/sidebar';
import ConversationDetails from './ConversationDetails';

const propTypes = {
  conversation: PropTypes.object.isRequired
};

class RightSidebar extends Component {
  renderIcon(text, className) {
    if (!text) {
      return null;
    }

    return (
      <Tip text={text}>
        <Icon icon={className} size={15} />
      </Tip>
    );
  }

  renderBasicInfo() {
    const { customer = {} } = this.props.conversation;
    const isUser = customer.isUser;

    return (
      <ActivityRow>
        <ActivityWrapper>
          <AvatarWrapper isUser={isUser}>
            <NameCard.Avatar customer={customer} size={60} />
            {isUser ? <Icon icon="checkmark" /> : <Icon icon="minus" />}
          </AvatarWrapper>

          <ActivityCaption>{customer.name || 'N/A'}</ActivityCaption>

          <IconWrapper>
            {this.renderIcon(customer.email, 'email')}
            {this.renderIcon(customer.phone, 'ios-telephone')}
          </IconWrapper>
        </ActivityWrapper>
      </ActivityRow>
    );
  }
  render() {
    const { customer = {} } = this.props.conversation;
    return (
      <Sidebar>
        {this.renderBasicInfo()}
        <MessengerSection customer={customer} />
        <TwitterSection customer={customer} />
        <FacebookSection customer={customer} />
        <ConversationDetails conversation={this.props.conversation} />
      </Sidebar>
    );
  }
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
