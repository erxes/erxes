import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { Chat } from '../../actions';


const propTypes = {
  dispatch: PropTypes.func.isRequired,
  conversation: PropTypes.object.isRequired,
  notifCount: PropTypes.number,
};

class Conversation extends Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const conversationId = this.props.conversation._id;

    // change current conversation
    this.props.dispatch(Chat.changeConversation(conversationId));

    // show message form
    this.props.dispatch(Chat.toMessageForm(true));

    // mark as read
    this.props.dispatch(Chat.readMessages(conversationId));
  }

  renderNewMessageCount() {
    const { notifCount } = this.props;
    if (notifCount > 0) {
      return (
        <div className="notif-count">
          {notifCount} new
        </div>
      );
    }
    return null;
  }

  renderMessageClass() {
    return this.props.notifCount > 0 ? 'message unread' : 'message';
  }

  render() {
    const { conversation } = this.props;
    return (
      <li className="erxes-conversation" onClick={this.onClick}>
        <div className="content">
          <div className={this.renderMessageClass()}>
            {conversation.content}
          </div>
          {this.renderNewMessageCount()}
        </div>
        <div className="info">
          {moment(conversation.createdAt).fromNow()}
        </div>
      </li>
    );
  }
}

Conversation.propTypes = propTypes;

export default Conversation;
