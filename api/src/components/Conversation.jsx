import React, { PropTypes } from 'react';
import TopBar from './TopBar.jsx';
import { MessageSender, MessagesList } from '../containers';


const propTypes = {
  goToConversationList: PropTypes.func.isRequired,
};

function Conversation({ goToConversationList }) {
  return (
    <div className="erxes-messenger">
      <TopBar
        middle="Messages"
        buttonClass="back"
        onButtonClick={goToConversationList}
      />
      <MessagesList />
      <MessageSender />
    </div>
  );
}

Conversation.propTypes = propTypes;

export default Conversation;
