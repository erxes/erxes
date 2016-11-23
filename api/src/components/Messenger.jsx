import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { MessageSender, MessagesList, ConversationList } from '../containers';


const propTypes = {
  currentPanel: PropTypes.string.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  goToConversation: PropTypes.func.isRequired,
};

function Chat({ currentPanel, goToConversationList, goToConversation }) {
  const isConversation = currentPanel === 'conversation';

  const classes = classNames('topbar-button', 'left', {
    back: isConversation,
    new: !isConversation,
  });
  const topBar = (
    <div className="erxes-topbar">
      <div
        className={classes}
        onClick={isConversation ? goToConversationList : goToConversation}
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
