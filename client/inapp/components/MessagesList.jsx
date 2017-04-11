import React, { PropTypes, Component } from 'react';
import { Message } from '../components';


const propTypes = {
  messages: PropTypes.array.isRequired,
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

  render() {
    const { data } = this.props;
    const inAppData = data.inAppData;
    const color = data.uiOptions && data.uiOptions.color;
    const isOnline = inAppData && inAppData.isOnline;
    const awayMessage = (
      <li className="erxes-spacial-message">
        {inAppData.awayMessage}
      </li>
    );

    const welcomeMessage = (
      <li className="erxes-spacial-message">
        {inAppData.welcomeMessage}
      </li>
    );

    return (
      <ul
        className="erxes-messages-list"
        ref={node => { this.node = node; }}
      >
        {isOnline ? welcomeMessage : null}
        {
          this.props.messages.map(message =>
            <Message color={color} key={message._id} {...message} />,
          )
        }
        {!isOnline ? awayMessage : null}
      </ul>
    );
  }
}

MessagesList.propTypes = propTypes;

export default MessagesList;
