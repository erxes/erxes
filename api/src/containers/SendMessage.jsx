import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Chat } from '../actions';


const propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  isAttachingFile: PropTypes.bool.isRequired,
};

let input;

class SendMessage extends React.Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    this.sendMessage();
  }

  sendMessage() {
    if (!input.value.trim()) {
      return;
    }

    // send message action
    this.props.dispatch(Chat.sendMessage(input.value));

    // clear input
    input.value = '';
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (e.shiftKey) {
        input.value += '\n';
      } else {
        this.sendMessage();
      }
    }
  }

  handleFileInput(e) {
    e.preventDefault();

    const file = e.target.files[0];
    this.props.dispatch(Chat.sendFile(file));
  }

  render() {
    return (
      <div>
        <form className="erxes-textarea" onSubmit={this.onSubmit}>
          <textarea
            className="reply"
            placeholder="Say hello ..."
            ref={node => { input = node; }}
            onKeyDown={this.handleKeyPress}
          />
          {
            this.props.isAttachingFile ?
              <div className="loader" /> :
              <label htmlFor="file-upload" className="btn-attach">
                <input id="file-upload" type="file" onChange={this.handleFileInput} />
              </label>
          }
        </form>
      </div>
    );
  }

}

const mapStateToProps = state => ({
  isAttachingFile: state.chat.isAttachingFile,
});

SendMessage.propTypes = propTypes;

export default connect(mapStateToProps)(SendMessage);
