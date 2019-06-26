import { IAttachmentPreview } from 'modules/common/types';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IConversation, IMessage } from '../../../../types';
import AttachmentPreview from './AttachmentPreview';
import { Message } from './messages';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
  attachmentPreview: IAttachmentPreview;
  scrollBottom: () => void;
  typingIndicator?: React.ReactNode;
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
    const { conversation, conversationMessages } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = (conversationMessages || []).slice();
    const firstMessage = messages[0];

    return this.renderMessages(messages, firstMessage);
  }

  render() {
    const { attachmentPreview, scrollBottom, typingIndicator } = this.props;

    return (
      <Wrapper isEmail={false}>
        {this.renderConversation()}
        {typingIndicator}
        <AttachmentPreview
          onLoad={scrollBottom}
          attachmentPreview={attachmentPreview}
        />
      </Wrapper>
    );
  }
}

export default Conversation;
