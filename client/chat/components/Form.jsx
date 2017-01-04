import React, { PropTypes } from 'react';
import { CONVERSATION_SENT } from '../constants';

export default class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = { content: '', showEmailInput: false };

    this.onSubmit = this.onSubmit.bind(this);
    this.onNewConversation = this.onNewConversation.bind(this);
  }

  onSubmit() {
    const { cachedEmail, cacheEmail, createConversation } = this.props;
    const contentTextArea = document.querySelector('.erxes-form textarea');
    const content = contentTextArea ? contentTextArea.value : '';

    // if email prevously saved, then create conversation with content
    // and cached email
    if (cachedEmail) {
      return createConversation({
        content,
        email: cachedEmail,
      });
    }

    // first ask for content then show email input
    if (!this.state.showEmailInput) {
      return this.setState({ showEmailInput: true, content });
    }

    const email = document.querySelector('.erxes-form input[type="email"]').value;

    if (email) {
      // save email for later use
      cacheEmail(email);

      return createConversation({
        content: this.state.content,
        email,
      });
    }

    return null;
  }

  onNewConversation() {
    this.props.newConversation();

    // reset states
    this.setState({ content: '', showEmailInput: false });
  }

  renderContent() {
    const status = this.props.status;

    const sendButton = (
      <button type="button" onClick={this.onSubmit}>
        Send
      </button>
    );

    const newConversationButton = (
      <button type="button" onClick={this.onNewConversation}>
        New conversation
      </button>
    );

    if (status === CONVERSATION_SENT) {
      return (
        <div>
          <span>Thanks</span>{newConversationButton}
        </div>
      );
    }

    if (this.state.showEmailInput) {
      return (
        <div>
          <input type="email" />{sendButton}
        </div>
      );
    }

    return (
      <div>
        <textarea></textarea>{sendButton}
      </div>
    );
  }

  render() {
    const title = (
      <div className="erxes-topbar-title">
        <div>Chat</div>
        <span>with Support staffs</span>
      </div>
    );

    const topBar = (
      <div className="erxes-topbar">
        <div className="erxes-middle">
          {title}
        </div>
      </div>
    );

    return (
      <div className="erxes-form">
        {topBar}

        {this.renderContent()}
      </div>
    );
  }
}

Form.propTypes = {
  createConversation: PropTypes.func.isRequired,
  cacheEmail: PropTypes.func.isRequired,
  newConversation: PropTypes.func.isRequired,
  cachedEmail: PropTypes.string,
  status: PropTypes.string.isRequired,
};
