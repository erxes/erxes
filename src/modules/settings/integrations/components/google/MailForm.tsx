import { EditorState } from 'draft-js';
import {
  Button,
  FormControl,
  Icon,
  Spinner,
  Tip
} from 'modules/common/components';
import {
  createStateFromHTML,
  ErxesEditor,
  toHTML
} from 'modules/common/components/editor/Editor';
import { __, Alert, uploadHandler } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import {
  AttachmentIndicator,
  EditorActions,
  FileName
} from 'modules/inbox/styles';
import { IIntegration } from 'modules/settings/integrations/types';
import * as React from 'react';
import {
  AttachmentContainer,
  AttachmentFile,
  ControlWrapper,
  LeftSection,
  MailEditorWrapper,
  Preview,
  Resipients
} from '../../styles';

type Props = {
  integrations: IIntegration[];
  toEmail?: string;
  toEmails?: ICustomer[];
  setAttachmentPreview?: (data: string | null) => void;
  attachmentPreview: { name: string; data: string; type: string };

  save: (
    params: {
      cc?: string;
      bcc?: string;
      toEmails?: string;
      subject?: string;
      body: string;
      integrationId?: string;
      attachments: string[];
    }
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
  attachments: string[];
  totalFileSize: number;
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      status: 'draft',
      isCc: false,
      isBcc: false,
      content: '',
      cc: '',
      bcc: '',
      toEmails: props.toEmail || '',
      from: '',
      subject: '',
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

  removeImage = (value: string) => {
    const { attachments } = this.state;

    this.setState({ attachments: attachments.filter(item => item !== value) });
  };

  handleFileInput = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    const { setAttachmentPreview } = this.props;

    uploadHandler({
      files,

      beforeUpload: () => {},

      afterUpload: ({ response, fileInfo }) => {
        if (this.state.totalFileSize > 10368000) {
          return Alert.error('It`s size exceeds the limit 10mb');
        }
        // set attachments
        this.setState({
          attachments: [...this.state.attachments, response],
          totalFileSize: this.state.totalFileSize + fileInfo.size
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

  onSend = () => {
    const { subject, cc, bcc, toEmails, from, attachments } = this.state;

    const body = this.getContent(this.state.editorState);
    const integrationId = from;

    this.props.save({
      subject,
      toEmails,
      cc,
      bcc,
      body,
      integrationId,
      attachments
    });

    this.cancelEditing();
  };

  cancelEditing = () => {
    this.setState({
      isCc: false,
      isBcc: false,
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

    if (toEmails.length > 0) {
      return (
        <FormControl
          componentClass="select"
          onChange={e =>
            this.onChange('toEmails', (e.target as HTMLInputElement).value)
          }
          value={this.state.toEmails}
        >
          <option />
          {toEmails.map(customer => (
            <option key={customer._id} value={customer._id}>
              {customer.primaryEmail || ''}
            </option>
          ))}
        </FormControl>
      );
    }

    return (
      <FormControl
        type="text"
        onChange={e =>
          this.onChange('toEmails', (e.target as HTMLInputElement).value)
        }
        value={this.state.toEmails}
      />
    );
  }

  renderCC() {
    if (!this.state.isCc) {
      return null;
    }

    return (
      <ControlWrapper>
        <span>Cc</span>
        <FormControl
          type="text"
          value={this.state.cc}
          onChange={e =>
            this.onChange('cc', (e.target as HTMLInputElement).value)
          }
        />
      </ControlWrapper>
    );
  }

  renderBCC() {
    if (!this.state.isBcc) {
      return null;
    }

    return (
      <ControlWrapper>
        <span>Bcc</span>
        <FormControl
          type="text"
          onChange={e =>
            this.onChange('bcc', (e.target as HTMLInputElement).value)
          }
          value={this.state.bcc}
        />
      </ControlWrapper>
    );
  }

  renderAttachmentPreview() {
    const { attachmentPreview } = this.props;

    if (!attachmentPreview) {
      return null;
    }

    return (
      <Preview>
        <AttachmentFile>{attachmentPreview.name}</AttachmentFile>
        <Spinner />
      </Preview>
    );
  }

  renderAttachments() {
    const { attachments } = this.state;

    if (attachments.length === 0) {
      return null;
    }

    return (
      <AttachmentIndicator>
        {attachments.map((attachment, index) => (
          <AttachmentContainer key={index}>
            <FileName>{attachment}</FileName>
            <Icon
              icon="cancel-1"
              size={18}
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                this.removeImage(attachment)
              }
            />
          </AttachmentContainer>
        ))}
      </AttachmentIndicator>
    );
  }

  renderButtons() {
    const { toEmails, from } = this.state;

    const disabled = toEmails && from ? false : true;

    return (
      <EditorActions>
        <Tip text={__('Attach file')}>
          <label>
            <Icon icon="upload-2" />
            <input type="file" onChange={this.handleFileInput} />
          </label>
        </Tip>

        <Button
          onClick={this.cancelEditing}
          btnStyle="simple"
          size="small"
          icon="cancel-1"
        >
          Discard
        </Button>
        <Button
          disabled={disabled}
          onClick={this.onSend}
          btnStyle="success"
          size="small"
          icon="send"
        >
          Send
        </Button>
      </EditorActions>
    );
  }

  render() {
    const props = {
      editorState: this.state.editorState,
      onChange: this.changeContent
    };

    return (
      <MailEditorWrapper>
        <ControlWrapper>
          <span>To</span>
          {this.renderToEmails()}

          <LeftSection>
            <Resipients
              onClick={() => this.onClick('isCc')}
              isActive={this.state.isCc}
            >
              Cc
            </Resipients>
            <Resipients
              onClick={() => this.onClick('isBcc')}
              isActive={this.state.isBcc}
            >
              Bcc
            </Resipients>
          </LeftSection>
        </ControlWrapper>
        {this.renderCC()}
        {this.renderBCC()}

        <ControlWrapper>
          <span>From</span>
          <FormControl
            componentClass="select"
            onChange={e =>
              this.onChange('from', (e.target as HTMLInputElement).value)
            }
            value={this.state.from}
          >
            <option />
            {this.renderFromOption()}
          </FormControl>
        </ControlWrapper>

        <ControlWrapper>
          <FormControl
            type="text"
            onChange={e =>
              this.onChange('subject', (e.target as HTMLInputElement).value)
            }
            placeholder="Subject"
            value={this.state.subject}
          />
        </ControlWrapper>

        <ErxesEditor {...props} />

        {this.renderAttachmentPreview()}
        {this.renderAttachments()}
        {this.renderButtons()}
      </MailEditorWrapper>
    );
  }
}

export default MailForm;
