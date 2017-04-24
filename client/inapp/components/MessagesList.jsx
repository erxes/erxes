import React, { PropTypes, Component } from 'react';
import { Message } from '../components';


const propTypes = {
  messages: PropTypes.array.isRequired,
  color: PropTypes.string,
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
      <ul
        className="erxes-messages-list"
        ref={node => { this.node = node; }}
      >
        {
          this.props.messages.map(message =>
            <Message color={this.props.color} key={message._id} {...message} />,
          )
        }
      </ul>
    );
  }
}

MessagesList.propTypes = propTypes;

export default MessagesList;
