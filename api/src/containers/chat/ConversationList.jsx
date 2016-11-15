import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Conversation from '../../components/chat/Conversation.jsx';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  conversations: PropTypes.array.isRequired,
  notifs: PropTypes.object.isRequired,
};

function ConversationList({ dispatch, conversations, notifs }) {
  return (
    <div className="erxes-content-container no-space">
      <ul className="erxes-conversations">
        {conversations.map((conversation) =>
          <Conversation
            key={conversation._id}
            dispatch={dispatch}
            conversation={conversation}
            notifCount={notifs[conversation._id]}
          />
        )}
      </ul>
    </div>
  );
}

const mapStateToProps = state => ({
  conversations: state.chat.conversations,
  notifs: state.notifs,
});

ConversationList.propTypes = propTypes;

export default connect(mapStateToProps)(ConversationList) ;
