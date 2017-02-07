import React, { PropTypes, Component } from 'react';
import { Button, Checkbox, ControlLabel } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';

import {
  ErxesEditor,
  createEmptyState,
  toHTML,
  getDefaultKeyBinding,
  createStateFromHTML,
} from '/imports/react-ui/common/Editor.jsx';
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
      // Using this key in editor component rendering. Draftjs content
      // can not be setted. So updating key will cause editor component
      // rerender. And our editor's content will render with new chosen
      // response template's content
      editorKey: 'editor',

      editorState: createEmptyState(),
      isInternal: false,
      attachments: [],
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.handleEditorKeyPress = this.handleEditorKeyPress.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.onSelectTemplate = this.onSelectTemplate.bind(this);
    this.onEditorContentChange = this.onEditorContentChange.bind(this);
  }

  onEditorContentChange(editorState) {
    this.setState({ editorState });
  }

  onSubmit(e) {
    e.preventDefault();
    this.addMessage();
  }

  onSelectTemplate(responseTemplate) {
    const editorState = createStateFromHTML(responseTemplate.content);

    this.setState({
      // Updating key will cause editor component
      // rerender. And our editor's content will render with new chosen
      // response template's content
      editorKey: `${this.state.editorKey}Updated`,

      editorState,

      // set attachment from response template files
      attachments: responseTemplate.files,
    });
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
    const { isInternal, attachments, editorState } = this.state;

    // get editor content
    const content = toHTML(editorState);

    const message = {
      conversationId: conversation._id,
      content: content || ' ',
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
  }

  handleEditorKeyPress(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      this.addMessage();

      // clear content
      this.setState({
        editorKey: `${this.state.editorKey}Cleared`,
        editorState: createStateFromHTML(''),
      });

      return null;
    }

    return getDefaultKeyBinding(e);
  }

  toggleForm() {
    this.setState({
      isInternal: !this.state.isInternal,
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
          content={toHTML(this.state.editorState)}
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

    let formId = 'reply-form';
    let placeholder = 'Type your message here...';

    if (this.state.isInternal) {
      formId = 'internal-note-form';
      placeholder = 'Type your note here...';
    }

    return (
      <div className="respond-box">
        <form id={formId} onSubmit={this.onSubmit}>
          {attachmentsIndicator}

          <ErxesEditor
            key={this.state.editorKey}
            state={this.state.editorState}
            placeholder={placeholder}
            onChange={this.onEditorContentChange}
            keyBindingFn={this.handleEditorKeyPress}
          />

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
