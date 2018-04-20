import React from 'react';
import PropTypes from 'prop-types';
import { iconPlus } from '../../icons/Icons';
import { ConversationItem, TopBar } from '../containers';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  createConversation: PropTypes.func.isRequired,
  goToConversation: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

function ConversationList({
  conversations,
  createConversation,
  goToConversation
}, {__}) {
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

ConversationList.propTypes = propTypes;
ConversationList.contextTypes = contextTypes;

export default ConversationList;
