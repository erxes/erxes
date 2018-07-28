import * as React from 'react';
import * as PropTypes from 'prop-types';
import { iconLeft } from '../../icons/Icons';
import { MessageSender, TopBar } from '../containers';
import { MessagesList } from './';
import { defaultAvatar } from '../../icons/Icons';

const propTypes = {
  messages: PropTypes.array.isRequired,
  goToConversationList: PropTypes.func.isRequired,
  users: PropTypes.array,
  data: PropTypes.object,
  isNew: PropTypes.bool,
  isOnline: PropTypes.bool,
  color: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
}

class Conversation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isFocused: false, expanded: false };

    this.onClick = this.onClick.bind(this);
    this.onTextInputBlur = this.onTextInputBlur.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { users } = this.props;

    if(users.length !== 0) {
      this.setState({ expanded: !this.state.expanded });
    }
  }

  onClick() {
    this.setState({ isFocused: true });
  }

  onTextInputBlur() {
    this.setState({ isFocused: false });
  }

  renderUserInfo(user, type) {
    const { color } = this.props;
    const details = user.details || {};
    const avatar = details.avatar || defaultAvatar;

    if(type === 'avatar') {
      return <img key={user._id} style={{ borderColor: color }} src={avatar} alt={details.fullName} />;
    }

    if(type === 'name') {
      return <span key={user._id}>{details.fullName} </span>;
    }

    return (
      <div key={user._id} className="erxes-staff-profile">
        <img src={avatar} alt={details.fullName} />
        <div className="erxes-staff-name">{details.fullName}</div>
        {type}
      </div>
    );
  }

  renderTitle() {
    const { __ } = this.context;
    const { users, isOnline } = this.props;

    if (users.length !== 0) {
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

      const avatars =  users.map(user => this.renderUserInfo(user, 'avatar'));
      const names =  users.map(user => this.renderUserInfo(user, 'name'));
      const supporters = users.map(user => this.renderUserInfo(user, state));

      return (
        <div>
          <div className="erxes-avatars">
            <div className="erxes-avatars-wrapper">{avatars}</div>
            <div className="erxers-names-wrapper">{names}</div>
            {state}
          </div>
          <div className="erxes-staffs">
            {supporters}
          </div>
        </div>
      );
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
          onToggle={this.toggle}
          isExpanded={this.state.expanded}
          onButtonClick={(e) => {
            e.preventDefault();
            goToConversationList();
          }}
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
