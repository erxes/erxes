import React, { PropTypes } from 'react';
import SendMessage from '../containers/SendMessage.jsx';
import MessageList from '../containers/MessageList';
import ConversationList from '../containers/ConversationList.jsx';


const propTypes = {
  email: PropTypes.string.isRequired,
  currentPanel: PropTypes.string.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  goToConversation: PropTypes.func.isRequired,
};

function Chat({ currentPanel, email, goToConversationList, goToConversation }) {
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
          <SendMessage email={email} />
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
