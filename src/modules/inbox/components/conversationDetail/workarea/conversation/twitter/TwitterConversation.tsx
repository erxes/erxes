import { TwitterMessage } from "modules/inbox/containers/conversationDetail";
import * as React from 'react';
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { IConversation, IMessage } from "../../../../../types";
import { SimpleMessage } from "../messages";

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
  scrollBottom: () => void;
};

interface INestedMessage extends IMessage {
  childMessages: INestedMessage[];
}

const List = styledTS<{ isRoot?: boolean }>(styled.ul)`
  list-style: none;
  padding-left: ${props => (props.isRoot ? "0" : "40px")};
  max-width: 700px;
`;

class TwitterConversation extends React.Component<Props, {}> {
  constructor(props) {
    super(props);

    this.formatMessages = this.formatMessages.bind(this);
    this.renderTweets = this.renderTweets.bind(this);
  }

  formatMessages(messages: IMessage[], parent: string | null) {
    const array: INestedMessage[] = [];

    messages.forEach(msg => {
      if (!msg.twitterData) {
        return null;
      }

      if (msg.twitterData.in_reply_to_status_id_str === parent) {
        const childMessages = this.formatMessages(
          messages,
          msg.twitterData.id_str
        );

        const child = msg;

        array.push({ ...child, childMessages });
      }

      return null;
    });

    return array;
  }

  renderChildren(children: INestedMessage[], integrationId: string) {
    if (!children) {
      return null;
    }

    return <List>{this.renderTweets(children, integrationId)}</List>;
  }

  renderTweets(messages: INestedMessage[], integrationId: string) {
    const { scrollBottom } = this.props;

    return messages.map(message => {
      return (
        <li key={message._id}>
          <TwitterMessage
            message={message}
            currentConversationId={this.props.conversation._id}
            integrationId={integrationId}
            scrollBottom={scrollBottom}
          />
          {this.renderChildren(message.childMessages, integrationId)}
        </li>
      );
    });
  }

  renderInternals(messages: IMessage[]) {
    return messages.filter(message => !message.twitterData).map(message => {
      return (
        <SimpleMessage
          message={message}
          isStaff={!message.customerId}
          key={message._id}
        />
      );
    });
  }

  render() {
    const { conversation, conversationMessages } = this.props;
    const integration = conversation.integration;
    const integrationId = integration && conversation.integration._id;

    if (!conversation) {
      return null;
    }

    const messages = conversationMessages || [];
    const nestedMessages: INestedMessage[] = this.formatMessages(
      messages,
      null
    );

    return (
      <React.Fragment>
        <List isRoot>{this.renderTweets(nestedMessages, integrationId)}</List>
        {this.renderInternals(messages)}
      </React.Fragment>
    );
  }
}

export default TwitterConversation;
