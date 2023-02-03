import {
  AddMessageMutationVariables,
  IConversation
} from '@erxes/ui-inbox/src/inbox/types';
import { Alert, __, readFile, uploadHandler } from 'coreui/utils';
import {
  Attachment,
  AttachmentIndicator,
  AttachmentThumb,
  EditorActions,
  FileName,
  MailRespondBox,
  Mask,
  MaskWrapper,
  PreviewImg,
  RespondBoxStyled,
  SmallEditor
} from '@erxes/ui-inbox/src/inbox/styles';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IAttachmentPreview } from '@erxes/ui/src/types';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import { IResponseTemplate } from '../../../../settings/responseTemplates/types';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import ManageVideoRoom from '../../../../videoCall/containers/ManageRoom';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import React from 'react';
import ResponseTemplate from '../../../containers/conversationDetail/responseTemplate/ResponseTemplate';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Tip from '@erxes/ui/src/components/Tip';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { deleteHandler } from '@erxes/ui/src/utils/uploadHandler';
import {
  getPluginConfig,
  isEnabled,
  loadDynamicComponent
} from '@erxes/ui/src/utils/core';

const Editor = asyncComponent(
  () => import(/* webpackChunkName: "Editor-in-Inbox" */ './Editor'),
  {
    height: '137px',
    width: '100%',
    color: '#fff'
  }
);

type Props = {
  conversation: IConversation;
  currentUser: IUser;
  sendMessage: (
    message: AddMessageMutationVariables,
    callback: (error: Error) => void
  ) => void;
  onSearchChange: (value: string) => void;
  showInternal: boolean;
  setAttachmentPreview?: (data: IAttachmentPreview) => void;
  responseTemplates: IResponseTemplate[];
  teamMembers: IUser[];
  refetchMessages: () => void;
  refetchDetail: () => void;
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
  loading: object;
  extraInfo?: any;
};

class RespondBox extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isInactive: !this.checkIsActive(props.conversation),
      editorKey: 'editor',
      isInternal: props.showInternal || false,
      sending: false,
      attachments: [],
      responseTemplate: '',
      content: '',
      mentionedUserIds: [],
      loading: {}
    };
  }
  isContentWritten() {
    const { content } = this.state;

    // draftjs empty content
    if (content === '<p><br></p>' || content === '') {
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const { sending, content, responseTemplate } = this.state;

    if (responseTemplate && responseTemplate === prevState.responseTemplate) {
      this.setState({ responseTemplate: '' });
    }

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

    if (this.props.showInternal !== nextProps.showInternal) {
      this.setState({
        isInternal: nextProps.showInternal
      });
    }
  }

  getUnsendMessage = (id: string) => {
    return localStorage.getItem(id) || '';
  };

  // save editor current content to state
  onEditorContentChange = (content: string) => {
    this.setState({ content });

    if (this.isContentWritten()) {
      localStorage.setItem(this.props.conversation._id, content);
    }

    if (this.props.conversation.integration.kind === 'telnyx') {
      const characterCount = this.calcCharacterCount(160);

      if (characterCount < 1) {
        Alert.warning(__('You have reached maximum number of characters'));
      }
    }
  };

  // save mentioned user to state
  onAddMention = (mentionedUserIds: string[]) => {
    this.setState({ mentionedUserIds });
  };

  onSearchChange = (value: string) => {
    this.props.onSearchChange(value);
  };

  checkIsActive(conversation: IConversation) {
    if (conversation.integration.kind === 'messenger') {
      return conversation.customer && conversation.customer.isOnline;
    }

    return true;
  }

  hideMask = () => {
    this.setState({ isInactive: false });

    const element = document.querySelector('.DraftEditor-root') as HTMLElement;

    if (!element) {
      return;
    }

    element.click();
  };

  onSend = (e: React.FormEvent) => {
    e.preventDefault();

    this.addMessage();

    // redrawing editor after send button, so editor content will be reseted
    this.setState({ editorKey: `${this.state.editorKey}Key` });
  };

  onSelectTemplate = (responseTemplate?: IResponseTemplate) => {
    if (!responseTemplate) {
      return null;
    }

    return this.setState({
      responseTemplate: responseTemplate.content,

      // set attachment from response template files
      attachments: responseTemplate.files || []
    });
  };

  handleDeleteFile = (url: string) => {
    const urlArray = url.split('/');

    // checking whether url is full path or just file name
    const fileName =
      urlArray.length === 1 ? url : urlArray[urlArray.length - 1];

    let loading = this.state.loading;
    loading[url] = true;

    this.setState({ loading });

    deleteHandler({
      fileName,
      afterUpload: ({ status }) => {
        if (status === 'ok') {
          const remainedAttachments = this.state.attachments.filter(
            a => a.url !== url
          );

          this.setState({ attachments: remainedAttachments });

          Alert.success('You successfully deleted a file');
        } else {
          Alert.error(status);
        }

        loading = this.state.loading;
        delete loading[url];

        this.setState({ loading });
      }
    });
  };

  handleFileInput = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    const { setAttachmentPreview } = this.props;

    uploadHandler({
      files,
      beforeUpload: () => {
        return;
      },

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
  };

  cleanText(text: string) {
    return text.replace(/&nbsp;/g, ' ');
  }

  calcCharacterCount = (maxlength: number) => {
    const { content } = this.state;
    const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, '');

    if (!cleanContent) {
      return maxlength;
    }

    const ret = maxlength - cleanContent.length;

    return ret > 0 ? ret : 0;
  };

  addMessage = () => {
    const { conversation, sendMessage } = this.props;
    const {
      isInternal,
      attachments,
      content,
      mentionedUserIds,
      extraInfo
    } = this.state;

    const message = {
      conversationId: conversation._id,
      content: this.cleanText(content) || ' ',
      extraInfo,
      contentType: 'text',
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

        localStorage.removeItem(this.props.conversation._id);

        // clear attachments, content, mentioned user ids
        return this.setState({
          attachments: [],
          content: '',
          sending: false,
          mentionedUserIds: []
        });
      });
    }
  };

  toggleForm = () => {
    this.setState({
      isInternal: !this.state.isInternal
    });
  };

  renderIndicator() {
    const { attachments, loading } = this.state;

    if (attachments.length > 0) {
      return (
        <AttachmentIndicator>
          {attachments.map(attachment => (
            <Attachment key={attachment.name}>
              <AttachmentThumb>
                {attachment.type.startsWith('image') && (
                  <PreviewImg
                    style={{
                      backgroundImage: `url(${readFile(attachment.url)})`
                    }}
                  />
                )}
              </AttachmentThumb>
              <FileName>{attachment.name}</FileName>
              <div>
                ({Math.round(attachment.size / 1000)}
                kB)
              </div>
              {loading[attachment.url] ? (
                <SmallLoader />
              ) : (
                <Icon
                  icon="times"
                  onClick={this.handleDeleteFile.bind(this, attachment.url)}
                />
              )}
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
        <Mask id="mask" onClick={this.hideMask}>
          {__(
            'Customer is offline Click to hide and send messages and they will receive them the next time they are online'
          )}
        </Mask>
      );
    }

    return null;
  }

  renderEditor() {
    const { isInternal, responseTemplate } = this.state;
    const { responseTemplates, conversation } = this.props;

    let type = 'message';

    if (isInternal) {
      type = 'note';
    }

    const placeholder = __(
      `To send your ${type} press Enter and Shift + Enter to add a new line`
    );

    return (
      <Editor
        currentConversation={conversation._id}
        defaultContent={this.getUnsendMessage(conversation._id)}
        integrationKind={conversation.integration.kind}
        key={this.state.editorKey}
        onChange={this.onEditorContentChange}
        onAddMention={this.onAddMention}
        onAddMessage={this.addMessage}
        onSearchChange={this.onSearchChange}
        placeholder={placeholder}
        mentions={this.props.teamMembers}
        showMentions={isInternal}
        responseTemplate={responseTemplate}
        responseTemplates={responseTemplates}
        handleFileInput={this.handleFileInput}
      />
    );
  }

  renderCheckbox(kind: string) {
    const { isInternal } = this.state;

    if (kind.includes('nylas') || kind === 'gmail') {
      return null;
    }

    return (
      <>
        {isEnabled('internalnotes') && (
          <FormControl
            id="conversationInternalNote"
            className="toggle-message"
            componentClass="checkbox"
            checked={isInternal}
            onChange={this.toggleForm}
            disabled={this.props.showInternal}
          >
            {__('Internal note')}
          </FormControl>
        )}
      </>
    );
  }

  renderVideoRoom() {
    const { conversation, refetchMessages, refetchDetail } = this.props;
    const integration = conversation.integration || ({} as IIntegration);

    if (this.state.isInternal || integration.kind !== 'messenger') {
      return null;
    }

    return (
      <ManageVideoRoom
        refetchMessages={refetchMessages}
        refetchDetail={refetchDetail}
        conversationId={conversation._id}
        activeVideo={conversation.videoCallData}
      />
    );
  }

  renderButtons() {
    const { conversation } = this.props;
    const integration = conversation.integration || ({} as IIntegration);
    const disabled =
      integration.kind.includes('nylas') || integration.kind === 'gmail';

    return (
      <EditorActions>
        {this.renderCheckbox(integration.kind)}
        {this.renderVideoRoom()}

        <Tip text={__('Attach file')}>
          <label>
            <Icon icon="paperclip" />
            <input
              type="file"
              onChange={this.handleFileInput}
              multiple={true}
            />
          </label>
        </Tip>

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
          icon="message"
        >
          {!disabled && 'Send'}
        </Button>
      </EditorActions>
    );
  }
  renderBody() {
    return (
      <>
        {this.renderEditor()}
        {this.renderIndicator()}
        {this.renderButtons()}
      </>
    );
  }

  renderContent() {
    const { conversation } = this.props;
    const { isInternal, isInactive, extraInfo } = this.state;

    const setExtraInfo = value => {
      this.setState({ extraInfo: value });
    };

    const { integration } = conversation;

    const integrations = getPluginConfig({
      pluginName: integration.kind.split('-')[0],
      configName: 'inboxIntegrations'
    });

    let dynamicComponent = null;

    if (integrations && integrations.length > 0) {
      const entry = integrations.find(s => s.kind === integration.kind);

      if (entry && entry.components && entry.components.length > 0) {
        const name = entry.components.find(
          el => el === 'inboxConversationDetailRespondBoxMask'
        );

        if (name) {
          dynamicComponent = loadDynamicComponent(name, {
            hideMask: this.hideMask,
            extraInfo,
            setExtraInfo,
            conversationId: conversation._id
          });
        }
      }
    }

    return (
      <MaskWrapper>
        {this.renderMask()}
        {dynamicComponent}
        <RespondBoxStyled isInternal={isInternal} isInactive={isInactive}>
          {this.renderBody()}
        </RespondBoxStyled>
      </MaskWrapper>
    );
  }

  renderMailRespondBox() {
    const { currentUser } = this.props;

    return (
      <MailRespondBox isInternal={true}>
        <NameCard.Avatar user={currentUser} size={34} />
        <SmallEditor>{this.renderBody()}</SmallEditor>
      </MailRespondBox>
    );
  }

  render() {
    const { conversation } = this.props;

    const integration = conversation.integration || ({} as IIntegration);
    const { kind } = integration;

    const isMail = kind.includes('nylas') || kind === 'gmail';

    if (isMail) {
      return this.renderMailRespondBox();
    }

    return this.renderContent();
  }
}

export default RespondBox;
