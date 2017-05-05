import React, { PropTypes } from 'react';
import TopBar from './TopBar';
import { MessageSender } from '../containers';
import { MessagesList } from '../components';


const propTypes = {
  messages: PropTypes.array.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  user: PropTypes.object,
  data: PropTypes.object,
  isNewConversation: PropTypes.bool,
};

function Conversation({ messages, isNewConversation, goToConversationList, user, data }) {
  function renderTitle() {
    if (user) {
      const isOnline = data.inAppData && data.inAppData.isOnline;
      const avatar = user.details.avatar || 'https://crm.nmma.co/images/userDefaultIcon.png';

      const state = (
        <div className="erxes-staff-company">
          { isOnline ?
            <div className="erxes-state online"><span /> Online</div> :
            <div className="erxes-state offline"><span /> Offline</div>
          }
        </div>
      );

      return (
        <div className="erxes-staff-profile">
          <img src={avatar} alt={user.details.fullName} />
          <div className="erxes-staff-name">{user.details.fullName}</div>
          {state}
        </div>
      );
    }

    return (
      <div className="erxes-topbar-title">
        <div>Conversation</div>
        <span>with Support staff</span>
      </div>
    );
  }

  const color = data.uiOptions && data.uiOptions.color;
  return (
    <div className="erxes-messenger">
      <TopBar
        middle={renderTitle()}
        buttonClass="back"
        color={color}
        onButtonClick={goToConversationList}
      />
      <MessagesList data={data} messages={messages} />
      <MessageSender placeholder={isNewConversation ? 'Send a message ...' : 'Write a reply ...'} />
    </div>
  );
}

Conversation.propTypes = propTypes;

export default Conversation;
