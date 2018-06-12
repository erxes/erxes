import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LeftSidebar, ConversationDetail } from '../containers';
import { Contents } from 'modules/layout/styles';

export default class Inbox extends Component {
  render() {
    const { currentConversationId } = this.props;

    return (
      <Contents>
        <LeftSidebar currentConversationId={currentConversationId} />
        <ConversationDetail currentId={currentConversationId} />
      </Contents>
    );
  }
}

Inbox.propTypes = {
  currentConversationId: PropTypes.string
};

Inbox.contextTypes = {
  __: PropTypes.func
};
