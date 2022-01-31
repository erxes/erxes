import Button from 'modules/common/components/Button';
import { CONVERSATION_STATUSES } from 'modules/inbox/constants';
import React from 'react';
import { IConversation } from '../types';

type Props = {
  conversations: IConversation[];
  changeStatus: (conversationIds: string[], status: string) => void;
};

class Resolver extends React.Component<Props> {
  changeStatus = (status: string) => {
    const { conversations, changeStatus } = this.props;

    // call change status method
    changeStatus(
      conversations.map(c => {
        return c._id;
      }),
      status
    );
  };

  render() {
    const hasClosedConversation = this.props.conversations.find(
      conversation => conversation.status === CONVERSATION_STATUSES.CLOSED
    );

    const buttonText = hasClosedConversation ? 'Open' : 'Resolve';
    const icon = hasClosedConversation ? 'redo' : 'check-circle';

    const btnAttrs = {
      size: 'small',
      btnStyle: hasClosedConversation ? 'warning' : 'success',
      icon,
      onClick: hasClosedConversation
        ? () => {
            this.changeStatus(CONVERSATION_STATUSES.OPEN);
          }
        : () => {
            this.changeStatus(CONVERSATION_STATUSES.CLOSED);
          }
    };

    return (
      <>
        <Button {...btnAttrs}>{buttonText}</Button>
      </>
    );
  }
}

export default Resolver;
