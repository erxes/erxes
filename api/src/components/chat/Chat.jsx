/* eslint-disable react/jsx-filename-extension */

import React, { PropTypes } from 'react';
import SendMessage from '../../containers/chat/SendMessage.jsx';
import MessageList from '../../containers/chat/MessageList';
import ConversationList from '../../containers/chat/ConversationList.jsx';


const propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  currentPanel: PropTypes.object.isRequired,
  switchPanel: PropTypes.func.isRequired,
};

export default class Chat extends React.Component {
  renderPanel() {
    const { currentPanel, dispatch, email } = this.props;

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

  render() {
    return (
      <div className="erxes-sidebar">
        <div className="erxes-topbar">
          <div className="left-option">
            <a onClick={this.props.switchPanel} />
          </div>
          <div className="erxes-title">{this.props.currentPanel.title}</div>
        </div>

        {this.renderPanel()}
      </div>
    );
  }
}

Chat.propTypes = propTypes;
