import React, { PropTypes, Component } from 'react';
import {
  Button,
  FormGroup,
  FormControl,
  Checkbox,
  ControlLabel,
} from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';

import uploadHandler from '/imports/api/client/uploadHandler';
import ResponseTemplate from './ResponseTemplate.jsx';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  responseTemplates: PropTypes.array.isRequired,
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
    this.onSelectTemplate = this.onSelectTemplate.bind(this);
  }

  onReply(e) {
    e.preventDefault();
    this.addMessage();
  }

  onNote(e) {
    e.preventDefault();
    this.addMessage(true);
  }

  onSelectTemplate(responseTemplate) {
    const content = document.getElementById('content');

    // set content from response template value
    content.value = responseTemplate.content;

    // set attachment from response template files
    this.setState({ attachments: responseTemplate.files });
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
            Object.assign({ url: response.url }, fileInfo),
          );

          // remove preview
          this.props.setAttachmentPreview(null);
        },

        afterRead: ({ result, fileInfo }) => {
          this.props.setAttachmentPreview(
            Object.assign({ data: result }, fileInfo),
          );
        },
      },
    );
  }

  addMessage(isInternal = false) {
    const { conversation, sendMessage } = this.props;
    const { attachments } = this.state;
    const content = document.getElementById('content');

    const message = {
      conversationId: conversation._id,
      content: content.value || ' ',
      internal: isInternal,
      attachments,
    };

    sendMessage(message, (error) => {
      if (error) {
        Alert.error(error.reason);
      } else {
        this.setState({ attachments: [] });
      }
    });

    content.value = '';
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

        <ResponseTemplate
          brandId={this.props.conversation.integration().brandId}
          attachments={this.state.attachments}
          responseTemplates={this.props.responseTemplates}
          onSelect={this.onSelectTemplate}
        />
      </div>
    );


    // after file upload show indicator
    let attachmentsIndicator = '';

    const attachments = this.state.attachments || [];
    const attachmentsCount = attachments.length;

    if (attachmentsCount > 0) {
      attachmentsIndicator = `has ${attachmentsCount} attachments`;
    }

    const formConversation = (
      <form id="reply-form" onSubmit={this.onReply}>
        {attachmentsIndicator}
        <FormGroup>
          <FormControl
            componentClass="textarea"
            rows={4}
            placeholder="Type your message here..."
            id="content"
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
            id="content"
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
