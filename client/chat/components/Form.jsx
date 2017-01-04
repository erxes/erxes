import React, { PropTypes } from 'react';

export default class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = { content: '', showEmailInput: false };

    this.onSubmit = this.onSubmit.bind(this);
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

  renderContent() {
    if (this.props.isConversationSent) {
      return <span>Thanks</span>;
    }

    if (this.state.showEmailInput) {
      return <input type="email" />;
    }

    return <textarea></textarea>;
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

        <button type="button" onClick={this.onSubmit}>Send</button>
      </div>
    );
  }
}

Form.propTypes = {
  createConversation: PropTypes.func.isRequired,
  cacheEmail: PropTypes.func.isRequired,
  cachedEmail: PropTypes.string,
  isConversationSent: PropTypes.bool.isRequired,
};
