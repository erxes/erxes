import React, { PropTypes } from 'react';
import { MessagesList, MessageSender, TopBar } from '../containers';


const propTypes = {
  messages: PropTypes.array.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  user: PropTypes.object,
  data: PropTypes.object,
  isNewConversation: PropTypes.bool,
  isOnline: PropTypes.bool,
  color: PropTypes.string,
};

function Conversation(props) {
  const {
    messages,
    isNewConversation,
    goToConversationList,
    user,
    data,
    isOnline,
    color,
  } = props;

  function renderTitle() {
    if (user) {
      const defaultImage = 'https://crm.nmma.co/images/userDefaultIcon.png';
      const avatar = user.details.avatar || defaultImage;

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

  const placeholder = isNewConversation ? 'Send a message ...' : 'Write a reply ...';

  return (
    <div className="erxes-messenger" style={{ border: `2px solid ${color}` }}>
      <TopBar
        middle={renderTitle()}
        buttonClass="back"
        onButtonClick={goToConversationList}
      />

      <MessagesList isOnline={isOnline} data={data} messages={messages} />
      <MessageSender placeholder={placeholder} />
    </div>
  );
}

Conversation.propTypes = propTypes;

Conversation.defaultProps = {
  user: {},
  data: {},
  isNewConversation: false,
  isOnline: false,
};

export default Conversation;
