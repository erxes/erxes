import { Button, FormControl, Icon, Tip } from 'modules/common/components';
import { __, Alert, uploadHandler } from 'modules/common/utils';
import * as React from 'react';

import {
  MessengerApp,
  ResponseTemplate
} from 'modules/inbox/containers/conversationDetail';

import {
  Attachment,
  AttachmentIndicator,
  AttachmentThumb,
  EditorActions,
  FileName,
  Mask,
  MaskWrapper,
  PreviewImg,
  RespondBoxStyled
} from 'modules/inbox/styles';

import { IUser } from '../../../../auth/types';
import { IIntegration } from '../../../../settings/integrations/types';
import { IResponseTemplate } from '../../../../settings/responseTemplates/types';
import { IAddMessage } from '../../../containers/conversationDetail/WorkArea';
import { IConversation } from '../../../types';
import Editor from './Editor';

type Props = {
  conversation: IConversation;
  sendMessage: (message: IAddMessage, callback: (error: Error) => void) => void;
  setAttachmentPreview?: (data: string | null) => void;
  responseTemplates: IResponseTemplate[];
  teamMembers: IUser[];
};

type State = {
  isInactive: boolean;
  isInternal: boolean;
  sending: boolean;
  attachments: any[];
  responseTemplate: string;
  content: string;
  mentionedUserIds: string[];
  editorKey: string;
};

class RespondBox extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isInactive: !this.checkIsActive(props.conversation),
      editorKey: 'editor',
      isInternal: false,
      sending: false,
      attachments: [],
      responseTemplate: '',
      content: '',
      mentionedUserIds: []
    };

    // on editor content change
    this.onEditorContentChange = this.onEditorContentChange.bind(this);

    // on new members mention
    this.onAddMention = this.onAddMention.bind(this);

    // on shift + enter press in editor
    this.onShifEnter = this.onShifEnter.bind(this);
    this.onSend = this.onSend.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.hideMask = this.hideMask.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.onSelectTemplate = this.onSelectTemplate.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const { sending, content } = this.state;

    if (sending && content !== prevState.content) {
      this.setState({ sending: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.conversation.customer !== nextProps.conversation.customer) {
      this.setState({
        isInactive: !this.checkIsActive(nextProps.conversation)
      });
    }
  }

  // save editor current content to state
  onEditorContentChange(content: string) {
    this.setState({ content });
  }

  // save mentioned user to state
  onAddMention(mentionedUserIds: string[]) {
    this.setState({ mentionedUserIds });
  }

  checkIsActive(conversation: IConversation) {
    return (
      conversation.integration.kind !== 'messenger' ||
      (conversation.customer &&
        conversation.customer.messengerData &&
        conversation.customer.messengerData.isActive)
    );
  }

  hideMask() {
    this.setState({ isInactive: false });

    const element = document.querySelector('.DraftEditor-root') as HTMLElement;

    element.click();
  }

  onSend(e: React.FormEvent) {
    e.preventDefault();

    this.addMessage();

    // redrawing editor after sned button, so editor content will be reseted
    this.setState({ editorKey: `${this.state.editorKey}Key` });
  }

  onSelectTemplate(responseTemplate?: IResponseTemplate) {
    if (!responseTemplate) return null;

    return this.setState({
      responseTemplate: responseTemplate.content,

      // set attachment from response template files
      attachments: responseTemplate.files || []
    });
  }

  // on shift + enter press in editor
  onShifEnter() {
    this.addMessage();
  }

  handleFileInput(e: React.FormEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    const { setAttachmentPreview } = this.props;

    uploadHandler({
      files,

      beforeUpload: () => {},

      afterUpload: ({ response, fileInfo }) => {
        // set attachments
        this.setState({
          attachments: [
            ...this.state.attachments,
            Object.assign({ url: response }, fileInfo)
          ]
        });
        // remove preview
        if (setAttachmentPreview) {
          setAttachmentPreview(null);
        }
      },

      afterRead: ({ result, fileInfo }) => {
        if (setAttachmentPreview) {
          setAttachmentPreview(Object.assign({ data: result }, fileInfo));
        }
      }
    });
  }

  cleanText(text: string) {
    return text.replace(/&nbsp;/g, ' ');
  }

  addMessage() {
    const { conversation, sendMessage } = this.props;
    const { isInternal, attachments, content, mentionedUserIds } = this.state;
    const message = {
      conversationId: conversation._id,
      content: this.cleanText(content) || ' ',
      internal: isInternal,
      attachments,
      mentionedUserIds
    };

    if (this.state.content && !this.state.sending) {
      this.setState({ sending: true });

      sendMessage(message, error => {
        if (error) {
          return Alert.error(error.message);
        }

        // clear attachments, content, mentioned user ids
        return this.setState({
          attachments: [],
          content: '',
          sending: false,
          mentionedUserIds: []
        });
      });
    }
  }

  toggleForm() {
    this.setState({
      isInternal: !this.state.isInternal
    });
  }

  renderIncicator() {
    const attachments = this.state.attachments;
    if (attachments.length > 0) {
      return (
        <AttachmentIndicator>
          {attachments.map(attachment => (
            <Attachment key={attachment.name}>
              <AttachmentThumb>
                {attachment.type.startsWith('image') && (
                  <PreviewImg
                    style={{ backgroundImage: `url('${attachment.url}')` }}
                  />
                )}
              </AttachmentThumb>
              <FileName>{attachment.name}</FileName>
              <div>
                ({Math.round(attachment.size / 1000)}
                kB)
              </div>
            </Attachment>
          ))}
        </AttachmentIndicator>
      );
    }

    return null;
  }

  renderMask() {
    if (this.state.isInactive) {
      return (
        <Mask onClick={this.hideMask}>
          {__(
            'Customer is offline Click to hide and send messages and they will receive them the next time they are online'
          )}
        </Mask>
      );
    }

    return null;
  }

  render() {
    const { isInternal, responseTemplate } = this.state;
    const { responseTemplates, conversation } = this.props;

    const integration = conversation.integration || ({} as IIntegration);

    const Buttons = (
      <EditorActions>
        <FormControl
          className="toggle-message"
          componentClass="checkbox"
          onChange={this.toggleForm}
        >
          {__('Internal note')}
        </FormControl>

        <Tip text={__('Attach file')}>
          <label>
            <Icon icon="upload-2" />
            <input type="file" onChange={this.handleFileInput} />
          </label>
        </Tip>

        <MessengerApp conversation={conversation} />

        <ResponseTemplate
          brandId={integration.brandId}
          attachments={this.state.attachments}
          content={this.state.content}
          onSelect={this.onSelectTemplate}
        />

        <Button
          onClick={this.onSend}
          btnStyle="success"
          size="small"
          icon="send"
        >
          Send
        </Button>
      </EditorActions>
    );

    let type = 'message';

    if (isInternal) {
      type = 'note';
    }

    const placeholder = __(
      `To send your ${type} press Enter and Shift + Enter to add a new line`
    );

    return (
      <MaskWrapper>
        {this.renderMask()}
        <RespondBoxStyled
          isInternal={isInternal}
          isInactive={this.state.isInactive}
        >
          <Editor
            key={this.state.editorKey}
            onChange={this.onEditorContentChange}
            onAddMention={this.onAddMention}
            onShifEnter={this.onShifEnter}
            placeholder={placeholder}
            mentions={this.props.teamMembers}
            showMentions={isInternal}
            responseTemplate={responseTemplate}
            responseTemplates={responseTemplates}
            handleFileInput={this.handleFileInput}
          />

          {this.renderIncicator()}
          {Buttons}
        </RespondBoxStyled>
      </MaskWrapper>
    );
  }
}

export default RespondBox;
