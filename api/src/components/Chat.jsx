import React, { PropTypes } from 'react';
import MessageSender from '../containers/MessageSender';
import MessageList from '../containers/MessageList';
import ConversationList from '../containers/ConversationList.jsx';


const propTypes = {
  currentPanel: PropTypes.string.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  goToConversation: PropTypes.func.isRequired,
};

function Chat({ currentPanel, goToConversationList, goToConversation }) {
  const isConversation = currentPanel === 'conversation';

  const topBar = (
    <div className="erxes-topbar">
      <div className={`left-option${isConversation ? '' : ' new-conversation'}`}>
        <a onClick={isConversation ? goToConversationList : goToConversation} />
      </div>
      <div className="erxes-title">
        {isConversation ? 'Messages' : 'Conversations'}
      </div>
    </div>
  );

  function renderPanel() {
    if (isConversation) {
      return (
        <div className="erxes-content">
          <MessageList />
          <MessageSender />
        </div>
      );
    }

    return <ConversationList />;
  }

  return (
    <div className="erxes-sidebar">
      {topBar}
      {renderPanel()}
    </div>
  );
}

Chat.propTypes = propTypes;

export default Chat;
