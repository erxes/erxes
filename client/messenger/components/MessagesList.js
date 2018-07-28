import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as classNames from 'classnames';
import { Message } from '../containers';

const propTypes = {
  messages: PropTypes.array.isRequired,
  isOnline: PropTypes.bool,
  data: PropTypes.object,
};

class MessagesList extends React.Component {
  componentDidMount() {
    this.node.scrollTop = this.node.scrollHeight;
    this.makeClickableLink();
  }

  componentWillUpdate() {
    const { node } = this;
    this.shouldScrollBottom =
      node.scrollHeight - (node.scrollTop + node.offsetHeight) < 30;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      this.node.scrollTop = this.node.scrollHeight;
    }

    this.makeClickableLink();
  }

  makeClickableLink() {
    const links = document.querySelectorAll('#erxes-messages a');

    for (const node of links) {
      node.target = '_blank';
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

  render() {
    const { data, messages } = this.props;
    const uiOptions = data.uiOptions || {};
    const bg = uiOptions.wallpaper;
    const messengerData = data.messengerData;
    const messagesClasses = classNames('erxes-messages-list', {
      [`bg-${bg}`]: bg,
    });

    return (
      <ul
        id="erxes-messages"
        className={messagesClasses}
        ref={(node) => {
          this.node = node;
        }}>
        {this.renderWelcomeMessage(messengerData)}
        {messages.map((message) => <Message key={message._id} {...message} />)}
        {this.renderAwayMessage(messengerData)}
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
