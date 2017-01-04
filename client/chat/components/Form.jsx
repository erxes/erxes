import React, { PropTypes } from 'react';

export default class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = { content: '', showEmailInput: false };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit() {
    // first ask for content then show email input
    if (!this.state.showEmailInput) {
      const content = document.querySelector('.erxes-form textarea').value;

      return this.setState({ showEmailInput: true, content });
    }

    const email = document.querySelector('.erxes-form input[type="email"]').value;

    if (email) {
      return this.props.createConversation({
        content: this.state.content,
        email,
      });
    }

    return 'email is required';
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
  isConversationSent: PropTypes.bool.isRequired,
};
