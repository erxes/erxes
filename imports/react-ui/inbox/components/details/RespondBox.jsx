import React, { PropTypes, Component } from 'react';
import { Button, Checkbox, ControlLabel } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';

import uploadHandler from '/imports/api/client/uploadHandler';
import Editor from './Editor.jsx';
import { ResponseTemplate } from '../../containers';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  sendMessage: PropTypes.func.isRequired,
  setAttachmentPreview: PropTypes.func.isRequired,
  teamMembers: PropTypes.object,
};

class RespondBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isInternal: false,
      attachments: [],
      responseTemplate: '',
      content: '',
      mentionedUserIds: [],
    };

    // on editor content change
    this.onEditorContentChange = this.onEditorContentChange.bind(this);

    // on new members mention
    this.onAddMention = this.onAddMention.bind(this);

    // on shift + enter press in editor
    this.onShifEnter = this.onShifEnter.bind(this);

    this.onSubmit = this.onSubmit.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.onSelectTemplate = this.onSelectTemplate.bind(this);
  }

  // save editor current content to state
  onEditorContentChange(content) {
    this.setState({ content });
  }

  // save mentioned user to state
  onAddMention(mentionedUserIds) {
    this.setState({ mentionedUserIds });
  }

  onSubmit(e) {
    e.preventDefault();

    this.addMessage();
  }

  onSelectTemplate(responseTemplate) {
    this.setState({
      responseTemplate: responseTemplate.content,

      // set attachment from response template files
      attachments: responseTemplate.files,
    });
  }

  // on shift + enter press in editor
  onShifEnter() {
    this.addMessage();
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

  addMessage() {
    const { conversation, sendMessage } = this.props;
    const { isInternal, attachments, content, mentionedUserIds } = this.state;

    const message = {
      conversationId: conversation._id,
      content: content || ' ',
      internal: isInternal,
      attachments,
      mentionedUserIds,
    };

    sendMessage(message, (error) => {
      if (error) {
        return Alert.error(error.reason);
      }

      // clear attachments
      return this.setState({ attachments: [] });
    });

    this.setState({
      // clear mentioned user ids
      mentionedUserIds: [],
    });
  }

  toggleForm() {
    this.setState({
      isInternal: !this.state.isInternal,
    });
  }

  render() {
    const { isInternal, responseTemplate } = this.state;

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
          content={this.state.content}
          onSelect={this.onSelectTemplate}
        />
      </div>
    );

    // after file upload show indicator
    let attachmentsIndicator = null;

    const attachments = this.state.attachments || [];
    const attachmentsCount = attachments.length;

    if (attachmentsCount > 0) {
      attachmentsIndicator = (
        <div className="attachment-indicator">
          {attachments.map(attachment =>
            <div className="attachment" key={attachment.name}>
              <div className="preview">
                <div className="preview-img" style={{ backgroundImage: `url('${attachment.url}')` }} />
              </div>
              <div className="file-name">{attachment.name}</div>
              <div className="file-size">({Math.round(attachment.size / 1000)}kB)</div>
            </div>,
          )}
        </div>
      );
    }

    let formId = 'reply-form';
    let placeholder = 'Type your message here...';

    if (isInternal) {
      formId = 'internal-note-form';
      placeholder = 'Type your note here...';
    }

    return (
      <div className="respond-box">
        <form id={formId} onSubmit={this.onSubmit}>
          <Editor
            onChange={this.onEditorContentChange}
            onAddMention={this.onAddMention}
            onShifEnter={this.onShifEnter}
            placeholder={placeholder}
            mentions={this.props.teamMembers}
            showMentions={isInternal}
            responseTemplate={responseTemplate}
          />

          {attachmentsIndicator}
          {Buttons}
        </form>

        <Checkbox onChange={this.toggleForm}>
          Leave as internal note
        </Checkbox>
      </div>
    );
  }
}

RespondBox.propTypes = propTypes;

export default RespondBox;
