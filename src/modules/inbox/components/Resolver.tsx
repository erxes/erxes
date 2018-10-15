import _ from 'lodash';
import { Button } from 'modules/common/components';
import { CONVERSATION_STATUSES } from 'modules/inbox/constants';
import * as React from 'react';
import { IConversation } from '../types';

type Props = {
  conversations: IConversation[];
  changeStatus: (conversationIds: string[], status: string) => void;
};

class Resolver extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.changeStatus = this.changeStatus.bind(this);
  }

  changeStatus(status: string) {
    const { conversations, changeStatus } = this.props;

    // call change status method
    changeStatus(
      conversations.map(c => {
        return c._id;
      }),
      status
    );
  }

  render() {
    const allNotClosed = _.reduce(
      this.props.conversations,
      (memo, conversation) =>
        conversation.status !== CONVERSATION_STATUSES.CLOSED,
      true
    );

    const buttonText = allNotClosed ? 'Resolve' : 'Open';
    const icon = allNotClosed ? 'checked' : 'refresh';

    const btnAttrs = {
      size: 'small',
      btnStyle: allNotClosed ? 'success' : 'warning',
      onClick: allNotClosed
        ? () => {
            this.changeStatus(CONVERSATION_STATUSES.CLOSED);
          }
        : () => {
            this.changeStatus(CONVERSATION_STATUSES.OPEN);
          }
    };

    return (
      <Button {...btnAttrs} icon={icon}>
        {buttonText}
      </Button>
    );
  }
}

export default Resolver;
