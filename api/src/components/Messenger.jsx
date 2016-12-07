import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { MessageSender, MessagesList, ConversationList } from '../containers';


const propTypes = {
  activeRoute: PropTypes.string.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  createConversation: PropTypes.func.isRequired,
};

function Chat({ activeRoute, goToConversationList, createConversation }) {
  const isConversation = activeRoute === 'conversation';

  const classes = classNames('topbar-button', 'left', {
    back: isConversation,
    new: !isConversation,
  });
  const topBar = (
    <div className="erxes-topbar">
      <div
        className={classes}
        onClick={isConversation ? goToConversationList : createConversation}
      />
      <div className="erxes-title">
        {isConversation ? 'Messages' : 'Conversations'}
      </div>
    </div>
  );

  return (
    <div className="erxes-messenger">
      {topBar}
      {isConversation ? <MessagesList /> : <ConversationList />}
      {isConversation ? <MessageSender /> : null}
    </div>
  );
}

Chat.propTypes = propTypes;

export default Chat;
