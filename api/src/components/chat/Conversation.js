import React, { PropTypes, Component } from 'react';
import { Chat, Customer } from '../../actions';

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
    this.props.dispatch(Customer.readMessages(conversationId));
  }

  render() {
    const { conversation, notifCount } = this.props;

    return (
      <li className="erxes-conversation" onClick={this.onClick}>
        <div className="message">
          {conversation.content} ({notifCount})
        </div>
      </li>
    );
  }
}

Conversation.propTypes = propTypes;

export default Conversation;
