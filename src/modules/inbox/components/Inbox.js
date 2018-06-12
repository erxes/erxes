import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LeftSidebar, ConversationDetail } from '../containers';

export default class Inbox extends Component {
  render() {
    const { currentConversationId } = this.props;

    return (
      <div>
        <LeftSidebar currentConversationId={currentConversationId} />
        <ConversationDetail currentId={currentConversationId} />
      </div>
    );
  }
}

Inbox.propTypes = {
  currentConversationId: PropTypes.string
};

Inbox.contextTypes = {
  __: PropTypes.func
};
