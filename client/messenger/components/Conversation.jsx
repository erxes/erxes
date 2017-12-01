/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Component, PropTypes } from 'react';
import { iconLeft } from '../../icons/Icons';
import { MessagesList, MessageSender, TopBar } from '../containers';

const propTypes = {
  messages: PropTypes.array.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  user: PropTypes.object,
  data: PropTypes.object,
  isNew: PropTypes.bool,
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
      const defaultImage = '/static/images/user.png';
      const details = user.details || {};
      const avatar = details.avatar || defaultImage;

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
          <img src={avatar} alt={details.fullName} />
          <div className="erxes-staff-name">{details.fullName}</div>
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
      isNew,
      goToConversationList,
      data,
      isOnline,
      color,
    } = this.props;

    const placeholder = isNew ? 'Send a message ...' : 'Write a reply ...';
    const style = { border: `1px solid ${color}` };

    return (
      <div onClick={this.onClick} className="erxes-messenger" style={style}>
        <TopBar
          middle={this.renderTitle()}
          buttonIcon={iconLeft}
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
  isNew: false,
  isOnline: false,
};

export default Conversation;
