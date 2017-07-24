import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import { Message } from '../containers';


const propTypes = {
  messages: PropTypes.array.isRequired,
  saveEmail: PropTypes.func,
  isOnline: PropTypes.bool,
  isObtainedEmail: PropTypes.bool,
  data: PropTypes.object,
};

class MessagesList extends Component {
  componentDidMount() {
    this.node.scrollTop = this.node.scrollHeight;
  }

  componentWillUpdate() {
    const { node } = this;
    this.shouldScrollBottom = (node.scrollTop + node.offsetHeight) === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      this.node.scrollTop = this.node.scrollHeight;
    }
  }

  renderAwayMessage(messengerData) {
    const { isOnline } = this.props;
    if (messengerData && !isOnline && messengerData.awayMessage) {
      return (
        <li className="erxes-spacial-message away">
          {messengerData.awayMessage}
        </li>
      );
    }

    return null;
  }

  renderWelcomeMessage(messengerData) {
    const { isOnline } = this.props;
    if (messengerData && isOnline && messengerData.welcomeMessage) {
      return (
        <li className="erxes-spacial-message">
          {messengerData.welcomeMessage}
        </li>
      );
    }

    return null;
  }

  renderEmailPrompt(color) {
    if (!this.props.isObtainedEmail) {
      return (
        <li className="erxes-spacial-message ml50">
          <label htmlFor="visitor-email">Get notified</label>
          <div className="ask-email">
            <input
              id="visitor-email"
              placeholder="email@domain.com"
              style={{ borderColor: color }}
            />

            <button
              onClick={this.props.saveEmail}
              style={{ backgroundColor: color }}
            />
          </div>
        </li>
      );
    }

    return null;
  }

  render() {
    const { data, messages } = this.props;
    const uiOptions = data.uiOptions || {};
    const bg = uiOptions.wallpaper;
    const color = uiOptions.color;
    const messengerData = data.messengerData;
    const messagesClasses = classNames('erxes-messages-list', { [`bg-${bg}`]: bg });

    return (
      <ul
        className={messagesClasses}
        ref={(node) => { this.node = node; }}
      >
        {this.renderWelcomeMessage(messengerData)}
        {
          messages.map(message =>
            <Message key={message._id} {...message} />,
          )
        }
        {this.renderAwayMessage(messengerData)}
        {this.renderEmailPrompt(color)}
      </ul>
    );
  }
}

MessagesList.propTypes = propTypes;

MessagesList.defaultProps = {
  isOnline: false,
  data: null,
};

export default MessagesList;
