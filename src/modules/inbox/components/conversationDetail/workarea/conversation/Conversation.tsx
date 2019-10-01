import { IAttachmentPreview } from 'modules/common/types';
import { FacebookPost } from 'modules/inbox/containers/conversationDetail';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IConversation, IMessage } from '../../../../types';
import MailConversation from '../mail/MailConversation';
import AttachmentPreview from './AttachmentPreview';
import Message from './messages/Message';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
  attachmentPreview: IAttachmentPreview;
  scrollBottom: () => void;
  loading: boolean;
};

const Wrapper = styledTS<{ isEmail?: boolean }>(styled.div)`
  padding: ${props => (props.isEmail ? '0' : '20px')};
  overflow: hidden;
  min-height: 100%;
  background: ${props => props.isEmail && '#fff'};

  > div:first-child {
    margin-top: 0;
  }
`;

class Conversation extends React.Component<Props, {}> {
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

  renderConversation() {
    const { conversation, conversationMessages, scrollBottom } = this.props;

    if (!conversation) {
      return null;
    }

    const { kind } = conversation.integration;

    if (kind === 'gmail') {
      return (
        <MailConversation
          conversation={conversation}
          conversationMessages={conversationMessages}
        />
      );
    }

    if (kind === 'facebook-post') {
      return (
        <FacebookPost scrollBottom={scrollBottom} conversation={conversation} />
      );
    }

    const messages = (conversationMessages || []).slice();
    const firstMessage = messages[0];

    return this.renderMessages(messages, firstMessage);
  }

  render() {
    const { attachmentPreview, scrollBottom } = this.props;

    return (
      <Wrapper isEmail={false}>
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
