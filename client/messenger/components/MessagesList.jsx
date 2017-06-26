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

  renderEmailPrompt() {
    if (!this.props.isObtainedEmail) {
      return (
        <div>
          <input id="visitor-email" />

          <button onClick={this.props.saveEmail}>ok</button>
        </div>
      );
    }

    return null;
  }

  render() {
    const { data } = this.props;
    const bg = data.uiOptions && data.uiOptions.wallpaper;
    const messengerData = data.messengerData;
    const messagesClasses = classNames('erxes-messages-list', { [`bg-${bg}`]: bg });

    return (
      <ul
        className={messagesClasses}
        ref={(node) => { this.node = node; }}
      >
        {this.renderWelcomeMessage(messengerData)}
        {
          this.props.messages.map(message =>
            <Message key={message._id} {...message} />,
          )
        }
        {this.renderAwayMessage(messengerData)}
        {this.renderEmailPrompt()}
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
