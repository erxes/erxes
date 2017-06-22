import React from 'react';

import FormBase from './FormBase';
import MessengerForm from './MessengerForm';

const propTypes = {};

class VisitorForm extends FormBase {
  constructor(props) {
    super(props);

    // binds
    this.onMessengerContentChange = this.onMessengerContentChange.bind(this);
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
