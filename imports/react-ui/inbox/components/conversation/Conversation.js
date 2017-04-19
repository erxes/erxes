import React, { PropTypes, Component } from 'react';
import { _ } from 'meteor/underscore';
import { Spinner } from '/imports/react-ui/common';
import Message from './Message';

const propTypes = {
  messages: PropTypes.array.isRequired,
  attachmentPreview: PropTypes.object,
};

class Conversation extends Component {
  constructor(props) {
    super(props);

    this.renderPreview = this.renderPreview.bind(this);
  }

  renderPreview() {
    const { attachmentPreview } = this.props;

    if (attachmentPreview && attachmentPreview.data) {
      return (
        <div className="message staff attach-preview">
          <div className="body">
            {attachmentPreview.type.startsWith('image')
              ? <img role="presentation" src={attachmentPreview.data} />
              : <div className="attach-file" />}
            <Spinner />
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    const { messages } = this.props;
    let tempId;

    const rows = [];

    _.each(messages, message => {
      rows.push(
        <Message
          isSameUser={message.userId ? message.userId === tempId : message.customerId === tempId}
          message={message}
          staff={!message.customerId}
          key={message._id}
        />,
      );

      tempId = message.userId ? message.userId : message.customerId;
    });

    return (
      <div className="conversation">
        {rows}
        {this.renderPreview()}
      </div>
    );
  }
}

Conversation.propTypes = propTypes;

export default Conversation;
