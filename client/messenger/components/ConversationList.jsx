import React from 'react';
import PropTypes from 'prop-types';
import { iconPlus } from '../../icons/Icons';
import { ConversationItem, TopBar } from '../containers';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  createConversation: PropTypes.func.isRequired,
  goToConversation: PropTypes.func.isRequired,
  color: PropTypes.string,
};

const contextTypes = {
  __: PropTypes.func
};

function ConversationList({
  conversations,
  createConversation,
  goToConversation,
  color,
}, {__}) {
  const title = (
    <div className="erxes-topbar-title">
      <div>{__('Conversations')}</div>
      <span>{__('with Support staffs')}</span>
    </div>
  );

  return (
    <div className="erxes-messenger" style={{ border: `1px solid ${color}` }}>
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
