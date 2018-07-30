import * as React from 'react';
import { iconPlus } from '../../icons/Icons';
import { __ } from '../../utils';
import { ConversationItem, TopBar } from '../containers';
import { IConversation } from '../types';

type Props = {
  conversations: IConversation[],
  createConversation: (e: React.FormEvent<HTMLButtonElement>) => void,
  goToConversation: (conversationId: string) => void,
  loading: boolean,
};

function ConversationList(props: Props) {
  const {
    conversations,
    createConversation,
    goToConversation,
    loading
  } = props;

  const title = (
    <div className="erxes-topbar-title">
      <div>{__('Conversations')}</div>
      <span>{__('with Support staffs')}</span>
    </div>
  );

  return (
    <div className="erxes-messenger">
      <TopBar
        middle={title}
        buttonIcon={iconPlus}
        onButtonClick={createConversation}
      />
      <ul className="erxes-conversation-list">
        {loading && <div className="loader bigger" />}
        {conversations.map(conversation => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            goToConversation={goToConversation}
          />
        ))}
      </ul>
    </div>
  );
}

export default ConversationList;
