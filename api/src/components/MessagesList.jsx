import React, { PropTypes, Component } from 'react';
import Message from './Message.jsx';


const propTypes = {
  messages: PropTypes.array.isRequired,
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
    return (
      <div
        className="erxes-content-container"
        ref={node => { this.node = node; }}
      >
        <ul className="erxes-conversation-messages">
          {
            this.props.messages.map(message =>
              <Message key={message._id} {...message} />
            )
          }
        </ul>
      </div>
    );
  }
}

MessagesList.propTypes = propTypes;

export default MessagesList;
