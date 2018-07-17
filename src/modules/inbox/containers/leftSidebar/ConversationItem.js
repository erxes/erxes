import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ConversationItem } from 'modules/inbox/components/leftSidebar';

export default class ConversationItemContainer extends Component {
  render() {
    const { conversation, currentConversationId } = this.props;

    const updatedProps = {
      ...this.props,
      isActive: conversation._id === currentConversationId
    };

    return <ConversationItem {...updatedProps} />;
  }
}

ConversationItemContainer.propTypes = {
  conversation: PropTypes.object,
  currentConversationId: PropTypes.string
};
