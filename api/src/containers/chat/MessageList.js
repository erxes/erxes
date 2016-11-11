import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Message from '../../components/chat/Message.jsx';


const propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    userId: PropTypes.string,
    customerId: PropTypes.string,
    sentAt: PropTypes.object.isRequired,
  }).isRequired).isRequired,
};

class MessageList extends Component {
  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    node.scrollTop = node.scrollHeight;
  }

  componentWillUpdate() {
    const node = ReactDOM.findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const node = ReactDOM.findDOMNode(this);
      node.scrollTop = node.scrollHeight;
    }
  }

  render() {
    return (
      <div className="erxes-content-container">
        <ul className="erxes-conversation-messages">
          {this.props.messages.map(message =>
            <Message
              key={message._id}
              {...message}
            />
          )}
        </ul>
      </div>
    );
  }
}

MessageList.propTypes = propTypes;

const mapStateToProps = state => ({
  messages: state.chat.messages,
});

export default connect(mapStateToProps)(MessageList);
