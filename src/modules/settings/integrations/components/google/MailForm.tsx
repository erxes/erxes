import { EditorState } from 'draft-js';
import { Button, FormControl, Icon, Tip } from 'modules/common/components';
import {
  createStateFromHTML,
  ErxesEditor,
  toHTML
} from 'modules/common/components/editor/Editor';
import { __, Alert } from 'modules/common/utils';
import { FileName } from 'modules/inbox/styles';
import {
  IGmailAttachment,
  IIntegration
} from 'modules/settings/integrations/types';
import * as React from 'react';
import {
  AttachmentContainer,
  Attachments,
  ControlWrapper,
  EditorFooter,
  LeftSection,
  MailEditorWrapper,
  Resipients
} from './styles';

type Props = {
  integrations: IIntegration[];
  toEmail?: string;
  toEmails?: string[];
  subject?: string;
  closeModal?: () => void;

  send: (
    params: {
      cc?: string;
      bcc?: string;
      toEmails?: string;
      subject?: string;
      body: string;
      integrationId?: string;
      attachments: IGmailAttachment[];
    },
    callback: () => void
  ) => void;
};

type State = {
  status?: string;
  cc?: string;
  bcc?: string;
  toEmails?: string;
  from?: string;
  subject?: string;
  isCc?: boolean;
  isBcc?: boolean;
  content: string;
  editorState: EditorState;
  integrations: IIntegration[];
  attachments: IGmailAttachment[];
  totalFileSize: number;
  isSending: boolean;
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      status: 'draft',
      isCc: false,
      isBcc: false,
      isSending: false,
      content: '',
      cc: '',
      bcc: '',
      toEmails: props.toEmail || '',
      from: '',
      subject: props.subject || '',
      attachments: [],
      totalFileSize: 0,
      integrations: props.integrations,
      editorState: createStateFromHTML(EditorState.createEmpty(), '')
    };
  }

  getContent = editorState => {
    return toHTML(editorState);
  };

  changeContent = editorState => {
    this.setState({ editorState });
  };

  onChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  onClick = (name: 'isCc' | 'isBcc') => {
    this.onChange(name, !this.state[name]);
  };

  handleFileInput = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;

    if (!files) {
      return;
    }

    if (files.length === 0) {
      return;
    }

    // tslint:disable-next-line
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const uploadReader = new FileReader();
      const fileInfo = {
        filename: file.name,
        size: file.size,
        mimeType: file.type
      };

      uploadReader.onloadend = () => {
        if (this.state.totalFileSize > 10368000) {
          return Alert.error('It`s size exceeds the limit 10mb');
        }

        const result = uploadReader.result;

        if (result) {
          const dataStr = result.toString();
          const data = dataStr.substr(dataStr.indexOf(',') + 1);

          const fileData = Object.assign({ data }, fileInfo);

          this.setState({
            attachments: [...this.state.attachments, fileData],
            totalFileSize: this.state.totalFileSize + fileInfo.size
          });
        }
      };

      uploadReader.readAsDataURL(file);
    }
  };

  onAfterSend = () => {
    this.cancelEditing();

    const { closeModal } = this.props;

    if (closeModal) {
      closeModal();
    }
  };

  onSend = () => {
    const { subject, cc, bcc, toEmails, from, attachments } = this.state;

    const body = this.getContent(this.state.editorState);
    const integrationId = from;

    this.setState({ isSending: true });

    this.props.send(
      {
        subject,
        toEmails,
        cc,
        bcc,
        body,
        integrationId,
        attachments
      },
      this.onAfterSend
    );
  };

  cancelEditing = () => {
    this.setState({
      isCc: false,
      isBcc: false,
      isSending: false,
      editorState: EditorState.createEmpty(),
      cc: '',
      bcc: '',
      toEmails: '',
      from: '',
      subject: '',
      attachments: []
    });
  };

  renderFromOption() {
    return this.props.integrations.map(i => (
      <option key={i._id} value={i._id}>
        {i.name}
      </option>
    ));
  }

  renderToEmails() {
    const { toEmails = [] } = this.props;

    const onChange = e =>
      this.onChange('toEmails', (e.target as HTMLInputElement).value);

    if (toEmails.length > 0) {
      return (
        <FormControl
          componentClass="select"
          onChange={onChange}
          value={this.state.toEmails}
        >
          <option />
          {toEmails.map((email, index) => (
            <option key={index} value={email}>
              {email}
            </option>
          ))}
        </FormControl>
      );
    }

    return (
      <FormControl
        type="text"
        onChange={onChange}
        value={this.state.toEmails}
      />
    );
  }

  renderCC() {
    if (!this.state.isCc) {
      return null;
    }

    const onChange = e =>
      this.onChange('cc', (e.target as HTMLInputElement).value);

    return (
      <ControlWrapper>
        <span>Cc:</span>
        <FormControl type="text" value={this.state.cc} onChange={onChange} />
      </ControlWrapper>
    );
  }

  renderBCC() {
    if (!this.state.isBcc) {
      return null;
    }

    const onChange = e =>
      this.onChange('bcc', (e.target as HTMLInputElement).value);

    return (
      <ControlWrapper>
        <span>Bcc:</span>
        <FormControl type="text" onChange={onChange} value={this.state.bcc} />
      </ControlWrapper>
    );
  }

  onRemoveAttach = (attachment: IGmailAttachment) => {
    const { attachments } = this.state;

    this.setState({
      attachments: attachments.filter(
        item => item.filename !== attachment.filename
      )
    });
  };

  renderAttachments() {
    const { attachments } = this.state;

    if (attachments.length === 0) {
      return null;
    }

    return (
      <Attachments>
        {attachments.map((attachment, index) => (
          <AttachmentContainer key={index}>
            <FileName>{attachment.filename}</FileName>
            <Icon
              icon="cancel-1"
              size={14}
              onClick={this.onRemoveAttach.bind(this, attachment)}
            />
          </AttachmentContainer>
        ))}
      </Attachments>
    );
  }

  renderCancelButton() {
    const { closeModal } = this.props;

    if (!closeModal) {
      return null;
    }

    return (
      <Button
        btnStyle="danger"
        size="small"
        onClick={closeModal}
        icon="cancel-1"
      >
        Close
      </Button>
    );
  }

  renderButtons() {
    const { toEmails, from, isSending } = this.state;

    const disabled = toEmails && from ? false : true;

    return (
      <EditorFooter>
        <Tip text={__('Attach file')}>
          <label>
            <Icon icon="attach" />
            <input
              type="file"
              onChange={this.handleFileInput}
              multiple={true}
            />
          </label>
        </Tip>
        <div>
          <Button
            onClick={this.cancelEditing}
            btnStyle="warning"
            size="small"
            icon="eraser-1"
          >
            Discard
          </Button>
          {this.renderCancelButton()}
          <Button
            disabled={disabled}
            onClick={this.onSend}
            btnStyle="success"
            size="small"
            icon="send"
          >
            {isSending ? 'Sending' : 'Send'}
          </Button>
        </div>
      </EditorFooter>
    );
  }

  render() {
    const onClickIsCC = () => this.onClick('isCc');
    const onClickIsBCC = () => this.onClick('isBcc');
    const formOnChange = e =>
      this.onChange('from', (e.target as HTMLInputElement).value);
    const textOnChange = e =>
      this.onChange('subject', (e.target as HTMLInputElement).value);

    return (
      <>
        <ControlWrapper>
          <span>To:</span>
          {this.renderToEmails()}

          <LeftSection>
            <Resipients onClick={onClickIsCC} isActive={this.state.isCc}>
              Cc
            </Resipients>
            <Resipients onClick={onClickIsBCC} isActive={this.state.isBcc}>
              Bcc
            </Resipients>
          </LeftSection>
        </ControlWrapper>
        {this.renderCC()}
        {this.renderBCC()}

        <ControlWrapper>
          <span>From:</span>
          <FormControl
            componentClass="select"
            onChange={formOnChange}
            value={this.state.from}
          >
            <option />
            {this.renderFromOption()}
          </FormControl>
        </ControlWrapper>

        <ControlWrapper>
          <FormControl
            type="text"
            onChange={textOnChange}
            placeholder="Subject"
            value={this.state.subject}
          />
        </ControlWrapper>

        <MailEditorWrapper>
          <ErxesEditor
            editorState={this.state.editorState}
            onChange={this.changeContent}
          />
        </MailEditorWrapper>

        {this.renderAttachments()}
        {this.renderButtons()}
      </>
    );
  }
}

export default MailForm;
