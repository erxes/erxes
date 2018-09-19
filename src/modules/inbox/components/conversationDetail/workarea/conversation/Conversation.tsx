import { Spinner } from "modules/common/components";
import * as React from "react";
import styled from "styled-components";
import { IConversation, IMessageDocument } from "../../../../types";
import AttachmentPreview from "./AttachmentPreview";
import { FacebookConversation } from "./facebook";
import { Message } from "./messages";
import { TwitterConversation } from "./twitter";

type Props = {
  conversation: IConversation;
  conversationMessages: IMessageDocument[];
  attachmentPreview: any;
  scrollBottom: () => void;
  loading: boolean;
};

const Wrapper = styled.div`
  padding: 20px;
  overflow: hidden;
  min-height: 80px;

  > div:first-child {
    margin-top: 0;
  }
`;

class Conversation extends React.Component<Props, {}> {
  renderMessages(
    messages: IMessageDocument[],
    conversationFirstMessage: IMessageDocument
  ) {
    const rows = [];

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
    const {
      loading,
      conversation,
      conversationMessages,
      scrollBottom
    } = this.props;
    const { kind } = conversation.integration;

    if (!conversation) {
      return null;
    }

    if ((kind === "facebook" || kind === "twitter") && loading) {
      return <Spinner objective />;
    }

    const twitterData = conversation.twitterData;
    const facebookData = conversation.facebookData;
    const isTweet = twitterData && !twitterData.isDirectMessage;
    const isFacebookPost = facebookData && facebookData.kind !== "messenger";

    if (isTweet) {
      return (
        <TwitterConversation
          conversation={conversation}
          conversationMessages={conversationMessages}
          scrollBottom={scrollBottom}
        />
      );
    }

    if (isFacebookPost) {
      return (
        <FacebookConversation
          conversation={conversation}
          conversationMessages={conversationMessages}
          scrollBottom={scrollBottom}
        />
      );
    }

    const messages = (conversationMessages || []).slice();
    const firstMessage = messages.length && messages[0];

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
