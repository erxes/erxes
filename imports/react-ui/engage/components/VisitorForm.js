import React from 'react';

import { METHODS } from '/imports/api/engage/constants';

import FormBase from './FormBase';
import MessengerForm from './MessengerForm';

const propTypes = {};

class VisitorForm extends FormBase {
  constructor(props) {
    super(props);

    // binds
    this.onMessengerContentChange = this.onMessengerContentChange.bind(this);
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      title: document.getElementById('title').value,
      fromUserId: document.getElementById('fromUserId').value,
      method: METHODS.MESSENGER,
      messenger: {
        sentAs: document.getElementById('messengerSentAs').value,
        content: this.state.messengerContent,
      },
    };

    return doc;
  }

  onMessengerContentChange(content) {
    this.setState({ messengerContent: content });
  }

  renderContent() {
    const message = this.getMessage();

    return <MessengerForm message={message} onContentChange={this.onMessengerContentChange} />;
  }
}

VisitorForm.propTypes = propTypes;

export default VisitorForm;
