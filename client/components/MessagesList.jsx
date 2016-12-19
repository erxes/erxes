import React, { PropTypes, Component } from 'react';
import { Message } from '../components';


const propTypes = {
  data: PropTypes.object.isRequired,
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
    const { loading, messages } = this.props.data;

    return (
      <ul
        className="erxes-messages-list"
        ref={node => { this.node = node; }}
      >
        {
          !loading && messages.map(message =>
            <Message key={message._id} {...message} />
          )
        }
      </ul>
    );
  }
}

MessagesList.propTypes = propTypes;

export default MessagesList;
