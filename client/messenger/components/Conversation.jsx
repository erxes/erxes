/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Component, PropTypes } from 'react';
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

class Conversation extends Component {
  constructor(props) {
    super(props);

    this.state = { isFocused: false };

    this.onClick = this.onClick.bind(this);
    this.onTextInputBlur = this.onTextInputBlur.bind(this);
  }

  onClick() {
    this.setState({ isFocused: true });
  }

  onTextInputBlur() {
    this.setState({ isFocused: false });
  }

  renderTitle() {
    const { user, isOnline } = this.props;

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

  render() {
    const {
      messages,
      isNewConversation,
      goToConversationList,
      data,
      isOnline,
      color,
    } = this.props;

    const placeholder = isNewConversation ? 'Send a message ...' : 'Write a reply ...';

    return (
      <div
        className="erxes-messenger"
        style={{ border: `2px solid ${color}` }}
        onClick={this.onClick}
      >

        <TopBar
          middle={this.renderTitle()}
          buttonClass="back"
          onButtonClick={goToConversationList}
        />

        <MessagesList isOnline={isOnline} data={data} messages={messages} />
        <MessageSender
          placeholder={placeholder}
          isParentFocused={this.state.isFocused}
          onTextInputBlur={this.onTextInputBlur}
        />
      </div>
    );
  }
}

Conversation.propTypes = propTypes;

Conversation.defaultProps = {
  user: {},
  data: {},
  isNewConversation: false,
  isOnline: false,
};

export default Conversation;
