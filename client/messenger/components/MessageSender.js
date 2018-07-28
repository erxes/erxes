import * as React from 'react';
import * as PropTypes from 'prop-types';
import { iconAttach } from '../../icons/Icons';

const propTypes = {
  placeholder: PropTypes.string,
  conversationId: PropTypes.string.isRequired,
  isAttachingFile: PropTypes.bool.isRequired,
  sendMessage: PropTypes.func.isRequired,
  sendFile: PropTypes.func.isRequired,
  readMessages: PropTypes.func.isRequired,
  onTextInputBlur: PropTypes.func.isRequired,
};

class MessageSender extends React.Component {
  constructor(props) {
    super(props);

    this.state = { message: '' };

    this.onSubmit = this.onSubmit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isParentFocused) { // eslint-disable-line
      if (this.props.conversationId) {
        this.props.readMessages(this.props.conversationId);
      }

      this.textarea.focus();
    }
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.sendMessage(this.state.message);
    this.setState({ message: '' });
  }

  handleMessageChange(e) {
    this.setState({ message: e.target.value });
  }

  handleOnBlur() {
    this.props.onTextInputBlur();
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
            ref={(textarea) => { this.textarea = textarea; }}
            className="reply"
            placeholder={this.props.placeholder}
            value={this.state.message}
            onChange={this.handleMessageChange}
            onBlur={this.handleOnBlur}
            autoFocus
            onKeyDown={this.handleKeyPress}
          />
          {
            this.props.isAttachingFile
              ? <div className="loader" />
              : <label htmlFor="file-upload" className="btn-attach">
                {iconAttach}
                <input id="file-upload" type="file" onChange={this.handleFileInput} />
              </label>
          }
        </form>
      </div>
    );
  }
}

MessageSender.propTypes = propTypes;

MessageSender.defaultProps = {
  placeholder: null,
};

export default MessageSender;
