import React from 'react';
import styled from 'styled-components';

import { IAttachmentPreview } from '@erxes/ui/src/types';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import AttachmentPreview from '@erxes/ui-inbox/src/inbox/components/conversationDetail/AttachmentPreview';

import FacebookConversation from '../../../containers/facebook/FacebookConversation';
import Message from './Message';
import { IConversationMessage } from '../../../types';

type Props = {
  conversation: IConversation;
  conversationMessages: IConversationMessage[];
  attachmentPreview: IAttachmentPreview;
  scrollBottom: () => void;
  loading: boolean;
};

const Wrapper = styled.div`
  padding: 20px;
  overflow: hidden;
  min-height: 100%;

  > div:first-child {
    margin-top: 0;
  }
`;

class Conversation extends React.Component<Props, { isResolved: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      isResolved: false
    };
  }

  renderMessages(
    messages: IConversationMessage[],
    conversationFirstMessage: IConversationMessage
  ) {
    const rows: React.ReactNode[] = [];

    let tempId;

    messages.forEach(message => {
      rows.push(
        <Message
          isSameUser={
            message.userId
              ? message.userId === tempId
              : message.customerId === tempId
          }
          conversationFirstMessage={conversationFirstMessage}
          message={message}
          key={message._id}
        />
      );

      tempId = message.userId ? message.userId : message.customerId;
    });

    return rows;
  }

  onPostToggleClick = () => {
    const { isResolved } = this.state;

    this.setState({ isResolved: isResolved ? false : true });
  };

  renderConversation() {
    const { conversation, conversationMessages, scrollBottom } = this.props;

    if (!conversation) {
      return null;
    }

    const { kind } = conversation.integration;
    const messages = (conversationMessages || []).slice();
    const firstMessage = messages[0];

    if (kind === 'facebook-post') {
      return (
        <FacebookConversation
          scrollBottom={scrollBottom}
          conversation={conversation}
          isResolved={this.state.isResolved}
          onToggleClick={this.onPostToggleClick}
        />
      );
    }

    return this.renderMessages(messages, firstMessage);
  }

  render() {
    const { attachmentPreview, scrollBottom } = this.props;

    return (
      <Wrapper>
        {this.renderConversation()}
        <AttachmentPreview
          onLoad={scrollBottom}
          attachmentPreview={attachmentPreview}
        />
      </Wrapper>
    );
  }
}

export default Conversation;
