import React, { PropTypes } from 'react';
import { CONVERSATION_SENT } from '../constants';

export default class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      content: '',
      showEmailInput: false,
      email: '',
      error: '',
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onNewConversation = this.onNewConversation.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  onSubmit() {
    const { cachedEmail, cacheEmail, createConversation } = this.props;
    const { content } = this.state;

    // if email prevously saved, then create conversation with content
    // and cached email
    if (cachedEmail && content) {
      return createConversation({
        content,
        email: cachedEmail,
      });
    }

    // first ask for content then show email input
    if (!this.state.showEmailInput && content) {
      return this.setState({ showEmailInput: true, content });
    }

    const email = this.state.email;

    if (!this.validateEmail(email)) {
      return this.setState({ error: 'Invalid email address.' });
    }

    if (email && content) {
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
    this.setState({ content: '', showEmailInput: false, error: '' });
  }

  validateEmail(mail) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(mail);
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();

      const { content } = this.state;
      if (e.shiftKey && !this.state.showEmailInput) {
        this.setState({ content: `${content}\n` });
      } else {
        this.onSubmit();
      }
    }
  }

  handleMessageChange(e) {
    this.setState({ content: e.target.value });
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  renderContent() {
    const status = this.props.status;

    const sendButton = (
      <button type="button" onClick={this.onSubmit} />
    );

    const newConversationButton = (
      <button type="button" onClick={this.onNewConversation}>
        New message
      </button>
    );

    if (status === CONVERSATION_SENT) {
      return (
        <div className="erxes-result">
          <div className="erxes-information">
            <span>
              Thanks for your message. We will follow up in a bit at
              <b> {this.props.cachedEmail}</b>
            </span>
            {newConversationButton}
          </div>
        </div>
      );
    }

    if (this.state.showEmailInput) {
      return (
        <div className="erxes-form-wrapper">
          <div className="erxes-information">
            <span>
              How can we reach you? Please type your email.
            </span>
            <div className="erxes-error">{this.state.error}</div>
          </div>
          <input
            placeholder="email@domain.com"
            type="email"
            onKeyDown={this.handleKeyPress}
            value={this.state.email}
            onChange={this.handleEmailChange}
          />
          {sendButton}
        </div>
      );
    }

    return (
      <div className="erxes-form-wrapper">
        <div className="erxes-information">
          <span>
            Hello! We’d love to help you out!
            Leave us a message and we’ll get back to you as soon as possible
          </span>
        </div>
        <textarea
          placeholder="Send a message"
          onKeyDown={this.handleKeyPress}
          value={this.state.content}
          onChange={this.handleMessageChange}
        />
        {sendButton}
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
