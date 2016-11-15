/* eslint-disable react/jsx-filename-extension */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ChatComponent from '../../components/chat/Chat.jsx';
import { Chat as ChatAction } from '../../actions';


const propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  showMessageForm: PropTypes.bool,
  conversations: PropTypes.array.isRequired,
};

const panelChoices = {
  messageList: {
    type: 'messageList',
    title: 'Messages',
  },

  conversationList: {
    type: 'conversationList',
    title: 'Conversations',
  },
};

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentPanel: panelChoices.conversationList };

    // when there is no previous conversation, show message form
    if (props.conversations.length === 0) {
      this.state.currentPanel = panelChoices.messageList;
    }

    this.switchPanel = this.switchPanel.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showMessageForm) {
      this.setState({ currentPanel: panelChoices.messageList });
    }
  }

  switchPanel(e) {
    e.preventDefault();

    let newPanel = panelChoices.messageList;

    if (this.state.currentPanel.type === 'messageList') {
      // reset current conversation
      this.props.dispatch(ChatAction.changeConversation(''));

      // hide message form
      this.props.dispatch(ChatAction.toMessageForm(false));

      newPanel = panelChoices.conversationList;
    }

    this.setState({ currentPanel: newPanel });
  }

  render() {
    const { dispatch, email } = this.props;

    return (
      <ChatComponent
        dispatch={dispatch}
        email={email}
        currentPanel={this.state.currentPanel}
        switchPanel={this.switchPanel}
      />
    );
  }
}

const mapStateToProps = state => ({
  showMessageForm: state.chat.showMessageForm,
  conversations: state.chat.conversations,
});

Chat.propTypes = propTypes;

export default connect(mapStateToProps)(Chat);
