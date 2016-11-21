import React, { PropTypes } from 'react';
import SendMessage from '../containers/SendMessage.jsx';
import MessageList from '../containers/MessageList';
import ConversationList from '../containers/ConversationList.jsx';


const propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  currentPanel: PropTypes.object.isRequired,
  switchPanel: PropTypes.func.isRequired,
};

function Chat({ currentPanel, dispatch, email, switchPanel }) {
  function renderPanel() {
    switch (currentPanel.type) {
      case 'messageList':
        return (
          <div className="erxes-content">
            <MessageList />
            <SendMessage dispatch={dispatch} email={email} />
          </div>
        );

      case 'conversationList':
        return <ConversationList dispatch={dispatch} />;

      default:
        return null;
    }
  }

  function renderClasses() {
    return currentPanel.type === 'conversationList'
      ? 'left-option new-conversation'
      : 'left-option';
  }

  return (
    <div className="erxes-sidebar">
      <div className="erxes-topbar">
        <div className={renderClasses()}>
          <a onClick={switchPanel} />
        </div>
        <div className="erxes-title">
          {currentPanel.title}
        </div>
      </div>

      {renderPanel()}
    </div>
  );
}

Chat.propTypes = propTypes;

export default Chat;
