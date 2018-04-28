/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import { iconLeft } from '../../icons/Icons';
import { MessagesList, MessageSender, TopBar } from '../containers';

const propTypes = {
  messages: PropTypes.array.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  users: PropTypes.array,
  data: PropTypes.object,
  isNew: PropTypes.bool,
  isOnline: PropTypes.bool
};

const contextTypes = {
  __: PropTypes.func
}

class Conversation extends React.Component {
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
    const { __ } = this.context;
    const { users, isOnline } = this.props;

    if (users.length !== 0) {
      const defaultImage = '/static/images/default-avatar.svg';

      const state = (
        <div className="erxes-staff-company">
          {isOnline ? (
            <div className="erxes-state online">
              <span /> {__('Online')}
            </div>
          ) : (
            <div className="erxes-state offline">
              <span /> {__("Offline")}
            </div>
          )}
        </div>
      );

      const supporters = users.map(user => {
        const details = user.details || {};
        const avatar = defaultImage;

        return (
          <div key={user._id} className="erxes-staff-profile">
            <img src={avatar} alt={details.fullName} />
            <div className="erxes-staff-name">{details.fullName}</div>
            {state}
          </div>
        );
      });

      return supporters;
    }

    return (
      <div className="erxes-topbar-title">
        <div>{__('Conversation')}</div>
        <span>{__('with Support staff')}</span>
      </div>
    );
  }

  render() {
    const {
      messages,
      isNew,
      goToConversationList,
      data,
      isOnline
    } = this.props;
    const { __ } = this.context;
    const placeholder = isNew ? __('Send a message') : __('Write a reply');

    return (
      <div onClick={this.onClick} className="erxes-messenger">
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
Conversation.contextTypes = contextTypes;

Conversation.defaultProps = {
  user: {},
  data: {},
  isNew: false,
  isOnline: false,
};

export default Conversation;
