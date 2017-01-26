import { _ } from 'meteor/underscore';
import React, { PropTypes, Component } from 'react';
import {
  Button,
  FormGroup,
  FormControl,
  Checkbox,
  ControlLabel,
  DropdownButton,
  MenuItem,
} from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';

import uploadHandler from '/imports/api/client/uploadHandler';


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
    this.onResponseTemplateSelect = this.onResponseTemplateSelect.bind(this);
  }

  onReply(e) {
    e.preventDefault();
    this.addMessage();
  }

  onNote(e) {
    e.preventDefault();
    this.addMessage(true);
  }

  onResponseTemplateSelect(eventKey) {
    const content = document.getElementById('content');

    const responseTemplates = this.props.responseTemplates;

    // find response template using event key
    const responseTemplate = _.find(responseTemplates, t => t._id === eventKey);

    // set content from response template value
    content.value = responseTemplate.content;
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

          // add message
          this.addMessage();
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

  renderResponseTemplates() {
    const { responseTemplates } = this.props;

    return (
      <div className="response-template">
        <DropdownButton
          bsStyle="link"
          title="Response template"
          dropup
          id="response-template"
          onSelect={this.onResponseTemplateSelect}
        >

          <MenuItem eventKey="save">Save</MenuItem>
          <MenuItem divider />

          {responseTemplates.map(template => (
            <MenuItem key={template._id} eventKey={template._id}>
              {template.name}
            </MenuItem>
          ))}
        </DropdownButton>
      </div>
    );
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

        {this.renderResponseTemplates()}
      </div>
    );

    const formConversation = (
      <form id="reply-form" onSubmit={this.onReply}>
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
