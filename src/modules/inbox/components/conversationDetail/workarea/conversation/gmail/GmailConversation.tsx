import { IConversation, IMessage } from 'modules/inbox/types';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Mail } from './';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
};

const List = styledTS<{ isRoot?: boolean }>(styled.ul)`
  list-style: none;
  padding-left: ${props => (props.isRoot ? '0' : '40px')};
  max-width: 700px;
`;

class GmailConversation extends React.Component<Props, {}> {
  render() {
    const { conversation, conversationMessages } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversationMessages || [];

    return (
      <>
        {messages.map(message => {
          return <Mail key={message._id} message={message} />;
        })}
      </>
    );
  }
}

export default GmailConversation;
