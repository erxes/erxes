import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  FormGroup,
  FormControl,
  Checkbox,
  ControlLabel,
} from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';

import uploadHandler from '/imports/api/client/uploadHandler';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  sendMessage: PropTypes.func.isRequired,
  setAttachmentPreview: PropTypes.func.isRequired,
};

class RespondBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      replyContent: null,
      noteContent: null,
      toggle: true,
      attachments: [],
    };

    this.onReply = this.onReply.bind(this);
    this.onNote = this.onNote.bind(this);
    this.handleReplyKeyPress = this.handleReplyKeyPress.bind(this);
    this.handleNoteKeyPress = this.handleNoteKeyPress.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
  }

  onReply(e) {
    e.preventDefault();
    this.addMessage();
  }

  onNote(e) {
    e.preventDefault();
    this.addMessage(true);
  }

  handleReplyKeyPress(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      this.addMessage();
    }
  }

  handleNoteKeyPress(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      this.addMessage(true);
    }
  }

  handleFileInput(e) {
    e.preventDefault();

    const file = e.target.files[0];

    uploadHandler(
      {
        file,

        beforeUpload: () => {
        },

        afterUpload: ({ response, fileInfo }) => {
          // set attachments
          this.state.attachments.push(
            Object.assign({ url: response.url }, fileInfo)
          );

          // remove preview
          this.props.setAttachmentPreview(null);

          // add message
          this.addMessage();
        },

        afterRead: ({ result, fileInfo }) => {
          this.props.setAttachmentPreview(
            Object.assign({ data: result }, fileInfo)
          );
        },
      }
    );
  }

  addMessage(isInternal = false) {
    const { conversation, sendMessage } = this.props;
    const { attachments } = this.state;
    const { reply, note } = this.refs;
    const node = ReactDOM.findDOMNode(isInternal ? note : reply);

    const message = {
      conversationId: conversation._id,
      content: node.value || ' ',
      internal: isInternal,
      attachments,
    };

    sendMessage(message, error => {
      if (error) {
        Alert.error(error.reason);
      } else {
        this.setState({ attachments: [] });
      }
    });
    node.value = '';
  }

  toggleForm() {
    this.setState({
      toggle: !this.state.toggle,
    });
  }

  render() {
    const Buttons = (
      <div>
        <Button type="submit" bsStyle="link">
          <i className="ion-reply" /> Send
        </Button>
        <ControlLabel className="btn btn-link btn-attach">
          <i className="ion-android-attach" /> Attach
          <input type="file" onChange={this.handleFileInput} />
        </ControlLabel>
      </div>
    );
    const formConversation = (
      <form id="reply-form" onSubmit={this.onReply}>
        <FormGroup>
          <FormControl
            componentClass="textarea"
            rows={4}
            placeholder="Type your message here..."
            ref="reply"
            onKeyDown={this.handleReplyKeyPress}
          />
        </FormGroup>

        {Buttons}
      </form>
    );

    const formNote = (
      <form id="internal-note-form" onSubmit={this.onNote}>
        <FormGroup>
          <FormControl
            componentClass="textarea"
            rows={4}
            placeholder="Type your note here..."
            ref="note"
            onKeyDown={this.handleNoteKeyPress}
          />
        </FormGroup>

        {Buttons}
      </form>
    );

    return (
      <div className="respond-box">
        {this.state.toggle ? formConversation : formNote}
        <Checkbox onChange={this.toggleForm}>
          Leave as internal note
        </Checkbox>
      </div>
    );
  }
}

RespondBox.propTypes = propTypes;

export default RespondBox;
