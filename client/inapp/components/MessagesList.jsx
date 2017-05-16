import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import { Message } from '../components';


const propTypes = {
  messages: PropTypes.array.isRequired,
  isOnline: PropTypes.bool,
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

  renderAwayMessage(isOnline, inAppData) {
    if (inAppData && !isOnline && inAppData.awayMessage) {
      return (
        <li className="erxes-spacial-message away">
          {inAppData.awayMessage}
        </li>
      );
    }
    return null;
  }

  renderWelcomeMessage(isOnline, inAppData) {
    if (inAppData && isOnline && inAppData.welcomeMessage) {
      return (
        <li className="erxes-spacial-message">
          {inAppData.welcomeMessage}
        </li>
      );
    }
    return null;
  }

  render() {
    const { isOnline, data } = this.props;
    const color = data.uiOptions && data.uiOptions.color;
    const bg = data.uiOptions && data.uiOptions.wallpaper;
    const inAppData = data.inAppData;
    const messagesClasses = classNames('erxes-messages-list', { [`bg-${bg}`]: bg });

    return (
      <ul
        className={messagesClasses}
        ref={node => { this.node = node; }}
      >
        {this.renderWelcomeMessage(isOnline, inAppData)}
        {
          this.props.messages.map(message =>
            <Message color={color} key={message._id} {...message} />,
          )
        }
        {this.renderAwayMessage(isOnline, inAppData)}
      </ul>
    );
  }
}

MessagesList.propTypes = propTypes;

export default MessagesList;
