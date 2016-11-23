import React, { PropTypes, Component } from 'react';


const propTypes = {
  isAttachingFile: PropTypes.bool.isRequired,
  sendMessage: PropTypes.func.isRequired,
  sendFile: PropTypes.func.isRequired,
};

class MessageSender extends Component {
  constructor(props) {
    super(props);

    this.state = { message: '' };

    this.onSubmit = this.onSubmit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.sendMessage(this.state.message);
    this.setState({ message: '' });
  }

  handleMessageChange(e) {
    this.setState({ message: e.target.value });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();

      const { message } = this.state;

      if (e.shiftKey) {
        this.setState({ message: `${message}\n` });
      } else {
        this.props.sendMessage(message);
        this.setState({ message: '' });
      }
    }
  }

  handleFileInput(e) {
    e.preventDefault();
    this.props.sendFile(e.target.files[0]);
  }

  render() {
    return (
      <div>
        <form className="erxes-message-sender" onSubmit={this.onSubmit}>
          <textarea
            className="reply"
            placeholder="Say hello ..."
            value={this.state.message}
            onChange={this.handleMessageChange}
            onKeyDown={this.handleKeyPress}
          />
          {
            this.props.isAttachingFile
              ? <div className="loader" />
              : <label htmlFor="file-upload" className="btn-attach">
                <input id="file-upload" type="file" onChange={this.handleFileInput} />
              </label>
          }
        </form>
      </div>
    );
  }
}

MessageSender.propTypes = propTypes;

export default MessageSender;
