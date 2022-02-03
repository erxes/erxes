import { IAttachmentPreview } from '@erxes/ui/src/types';
import { FacebookPost } from '../../../../containers/conversationDetail';
import React from 'react';
import styled from 'styled-components';
import { IConversation, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import CallPro from '../callpro/Callpro';
import MailConversation from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/mail/MailConversation';
import AttachmentPreview from './AttachmentPreview';
import Message from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/Message';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
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

  renderMessages(messages: IMessage[], conversationFirstMessage: IMessage) {
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

    if (kind.includes('nylas') || kind === 'gmail') {
      return (
        <MailConversation
          conversation={conversation}
          conversationMessages={conversationMessages}
        />
      );
    }

    if (kind === 'facebook-post') {
      return (
        <FacebookPost
          scrollBottom={scrollBottom}
          conversation={conversation}
          isResolved={this.state.isResolved}
          onToggleClick={this.onPostToggleClick}
        />
      );
    }

    if (kind === 'callpro') {
      return (
        <>
          <CallPro conversation={conversation} />
          {this.renderMessages(messages, firstMessage)}
        </>
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
