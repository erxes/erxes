import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Chat } from '../../actions';
import Conversation from '../../components/chat/Conversation';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  conversations: PropTypes.array.isRequired,
  notifs: PropTypes.object.isRequired,
};

class ConversationList extends Component {
  constructor(props) {
    super(props);

    this.onNewMessageClick = this.onNewMessageClick.bind(this);
  }

  onNewMessageClick() {
    // show message form
    this.props.dispatch(Chat.toMessageForm(true));
  }

  render() {
    const { dispatch, conversations, notifs } = this.props;

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

        <button onClick={this.onNewMessageClick}>New message</button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  conversations: state.chat.conversations,
  notifs: state.notifs,
});

ConversationList.propTypes = propTypes;

export default connect(mapStateToProps)(ConversationList) ;
