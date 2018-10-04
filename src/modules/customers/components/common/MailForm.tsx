import { EditorState } from 'draft-js';
import { Button, FormControl, Icon, Tip } from 'modules/common/components';
import { createStateFromHTML, ErxesEditor, toHTML } from 'modules/common/components/editor/Editor';
import { __, uploadHandler } from 'modules/common/utils';
import { EditorActions } from 'modules/inbox/styles';
import { IIntegration } from 'modules/settings/integrations/types';
import * as React from 'react';
import { ControlWrapper, LeftSection, MailEditorWrapper, Resipients } from '../../styles';

type Props = {
  integrations: IIntegration[];
  customerEmail?: string;
  save: (params: {
    cc?: string;
    bcc?: string;
    toEmails?: string;
    subject?: string;
    body: string;
    integrationId?: string;
  }) => any;
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
  attachmentPreview: any;
  attachments: any[];
}

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
        toEmails: props.customerEmail || '',
        from: '',
        subject: '',
        attachmentPreview: {},
        attachments: [],
        integrations: props.integrations,
        editorState: createStateFromHTML(
            EditorState.createEmpty(),
            ''
        )
    };
 
    this.onChange = this.onChange.bind(this);
    this.changeContent = this.changeContent.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSend = this.onSend.bind(this);
    this.getContent = this.getContent.bind(this);
    this.setAttachmentPreview = this.setAttachmentPreview.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
  }

  getContent(editorState) {
    return toHTML(editorState);
  }

  changeContent(editorState) {
    this.setState({ editorState });
  }
  
  onChange<T extends keyof State>(name: T, value: State[T]) {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  }

  onClick(name: 'isCc' | 'isBcc') {
    this.onChange(name, !this.state[name]);
  }

  setAttachmentPreview(attachmentPreview) {
    this.setState({ attachmentPreview });
  }

  handleFileInput(e: React.FormEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;

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
        this.setAttachmentPreview(null);
      },

      afterRead: ({ result, fileInfo }) => {
        this.setAttachmentPreview(Object.assign({ data: result }, fileInfo));
      }
    });
  }

  onSend() {
    const { subject, cc, bcc, toEmails, from } = this.state;

    const body = this.getContent(this.state.editorState);
    const integrationId = from;

    this.props.save({
      subject,
      toEmails,
      cc,
      bcc,
      body,
      integrationId
    });

    this.cancelEditing();
  }

  cancelEditing() {
    this.setState({ isCc: false, isBcc: false, editorState: EditorState.createEmpty(), cc: '', bcc: '', toEmails: '', from: '', subject: '' });
  }

  renderFromOption() {
    return (
      this.props.integrations.map(i => (
        <option key={i._id} value={i._id}>{i.name}</option>
      ))
    );
  }

  renderCC() {
    if(!this.state.isCc) {
      return null;
    }

    return (
      <ControlWrapper>
        <span>Cc</span>
        <FormControl
          type="text"
          value={this.state.cc}
          onChange={e => this.onChange('cc', (e.target as HTMLInputElement).value)}
        />
    </ControlWrapper>
    );
  }

  renderBCC() {
    if(!this.state.isBcc) {
      return null;
    }

    return (
      <ControlWrapper>
        <span>Bcc</span>
        <FormControl
          type="text"
          onChange={e => this.onChange('bcc', (e.target as HTMLInputElement).value)}
          value={this.state.bcc}
        />
    </ControlWrapper>
    );
  }

  renderButtons() {
    return (
      <EditorActions>
        <Tip text={__("Attach file")}>
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
          onClick={this.onSend}
          btnStyle="success"
          size="small"
          icon="send"
        >
          Save
        </Button>
      </EditorActions>
    );
  }

  render() {
    const props = {
      editorState: this.state.editorState,
      onChange: this.changeContent,
    };

    return (
      <MailEditorWrapper>
        <ControlWrapper>
            <span>To</span>
            <FormControl
              type="text"
              onChange={e => this.onChange('toEmails', (e.target as HTMLInputElement).value)}
              value={this.state.toEmails}
            />
            <LeftSection>
              <Resipients onClick={() => this.onClick('isCc')} isActive={this.state.isCc}>Cc</Resipients>
              <Resipients onClick={() => this.onClick('isBcc')} isActive={this.state.isBcc}>Bcc</Resipients>
            </LeftSection>
        </ControlWrapper>
        {this.renderCC()}
        {this.renderBCC()}

        <ControlWrapper>
            <span>From</span>
            <FormControl
              componentClass="select"
              onChange={e => this.onChange('from', (e.target as HTMLInputElement).value)}
              value={this.state.from}
            > 
              <option />
              {this.renderFromOption()} 
            </FormControl>
        </ControlWrapper>

        <ControlWrapper>
            <FormControl
              type="text"
              onChange={e => this.onChange('subject', (e.target as HTMLInputElement).value)}
              placeholder="Subject"
              value={this.state.subject}
            />
        </ControlWrapper>

        <ErxesEditor {...props} />
        {this.renderButtons()}
      </MailEditorWrapper>
    );
  }
}

export default MailForm;
