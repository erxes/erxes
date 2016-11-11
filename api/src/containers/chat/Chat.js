/* eslint-disable react/jsx-filename-extension */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SendMessage from './SendMessage.jsx';
import MessageList from './MessageList';
import ConversationList from './ConversationList.jsx';


const propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
};

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Messages',
      toggle: false,
    };

    this.showConversations = this.showConversations.bind(this);
  }

  showConversations(e) {
    e.preventDefault();

    this.setState({
      toggle: !this.state.toggle,
      title: this.state.toggle ? 'Messages' : 'Conversations',
    });
  }


  render() {
    const { dispatch, email } = this.props;

    const messageList = (
      <div className="erxes-content">
        <MessageList />
        <SendMessage dispatch={dispatch} email={email} />
      </div>
    );

    const conversationList = <ConversationList />;

    return (
      <div className="erxes-sidebar">
        <div className="erxes-topbar">
          <div className="left-option">
            <a onClick={this.showConversations} />
          </div>
          <div className="erxes-title">{this.state.title}</div>
        </div>

        {this.state.toggle ? conversationList : messageList}

      </div>
    );
  }
}

Chat.propTypes = propTypes;

export default connect()(Chat);
