import {
  Button,
  ControlLabel,
  EditorCK,
  Form,
  FormControl,
  FormGroup,
  Icon,
  Spinner,
  Tip
} from 'modules/common/components';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { EMAIL_CONTENT } from 'modules/engage/constants';
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
  Resipients,
  Uploading
} from './styles';

type Props = {
  integrationId?: string;
  integrations: IIntegration[];
  closeModal?: () => void;
  toEmail?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
  integrations: IIntegration[];
  attachments: IGmailAttachment[];
  totalFileSize: number;
  isUploading: boolean;
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      status: 'draft',
      isCc: false,
      isBcc: false,
      isUploading: false,
      content: '',
      cc: '',
      bcc: '',
      toEmails: props.toEmail || '',
      from: '',
      subject: '',
      attachments: [],
      totalFileSize: 0,
      integrations: props.integrations
    };
  }

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  generateDoc = (values: {
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    from: string;
  }) => {
    const { content, attachments } = this.state;
    const erxesApiId = values.from;

    return {
      ...values,
      attachments,
      textHtml: content,
      erxesApiId
    };
  };

  onClick = (name: string) => {
    if (name === 'isBcc') {
      this.setState({ isBcc: true });
    } else {
      this.setState({ isCc: true });
    }
  };

  handleFileInput = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;

    if (!files) {
      return;
    }

    if (files.length === 0) {
      return;
    }

    this.setState({ isUploading: true });

    let j = 0;

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
        const totalFileSize = this.state.totalFileSize + fileInfo.size;

        if (totalFileSize > 10368000) {
          this.setState({
            isUploading: false
          });

          return Alert.error('It`s size exceeds the limit 10mb');
        }

        const result = uploadReader.result;

        if (result) {
          const dataStr = result.toString();
          const data = dataStr.substr(dataStr.indexOf(',') + 1);

          const fileData = Object.assign({ data }, fileInfo);

          this.setState({
            attachments: [...this.state.attachments, fileData],
            totalFileSize
          });

          j++;

          if (j === files.length) {
            this.setState({
              isUploading: false
            });
          }
        }
      };

      uploadReader.readAsDataURL(file);
    }
  };

  renderFromOption() {
    return this.props.integrations.map(i => (
      <option key={i._id} value={i._id}>
        {i.name}
      </option>
    ));
  }

  renderCC(formProps: IFormProps) {
    if (!this.state.isCc) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Cc:</ControlLabel>
        <FormControl {...formProps} name="cc" />
      </FormGroup>
    );
  }

  renderBCC(formProps: IFormProps) {
    if (!this.state.isBcc) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Bcc:</ControlLabel>
        <FormControl {...formProps} name="bcc" />
      </FormGroup>
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
    const { attachments, isUploading } = this.state;

    return (
      <Attachments>
        {attachments.map((attachment, index) => (
          <AttachmentContainer key={index}>
            <FileName>{attachment.filename}</FileName>
            {attachment.size ? (
              <div>
                ({Math.round(attachment.size / 1000)}
                kB)
              </div>
            ) : null}
            <Icon
              icon="cancel-1"
              size={14}
              onClick={this.onRemoveAttach.bind(this, attachment)}
            />
          </AttachmentContainer>
        ))}
        {isUploading ? (
          <Uploading>
            <Spinner /> <span>uploading ...</span>
          </Uploading>
        ) : null}
      </Attachments>
    );
  }

  renderCancelButton() {
    const { closeModal } = this.props;

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

  renderButtons(values, isSubmitted) {
    const { closeModal, renderButton } = this.props;

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
          {this.renderCancelButton()}
          {renderButton({
            name: 'mailForm',
            values: this.generateDoc(values),
            callback: closeModal,
            isSubmitted
          })}
        </div>
      </EditorFooter>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const onClickIsCC = () => this.onClick('isCc');
    const onClickIsBCC = () => this.onClick('isBcc');

    return (
      <>
        <ControlWrapper>
          <FormGroup>
            <ControlLabel required={true}>To:</ControlLabel>
            <FormControl
              {...formProps}
              value={this.state.toEmails}
              name="to"
              required={true}
            />
          </FormGroup>

          <LeftSection>
            <Resipients onClick={onClickIsCC} isActive={this.state.isCc}>
              Cc
            </Resipients>
            <Resipients onClick={onClickIsBCC} isActive={this.state.isBcc}>
              Bcc
            </Resipients>
          </LeftSection>
        </ControlWrapper>

        {this.renderCC(formProps)}
        {this.renderBCC(formProps)}

        <FormGroup>
          <ControlLabel required={true}>From:</ControlLabel>
          <FormControl
            required={true}
            componentClass="select"
            {...formProps}
            name="from"
          >
            <option />
            {this.renderFromOption()}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Subject:</ControlLabel>
          <FormControl {...formProps} name="subject" required={true} />
        </FormGroup>

        <FormGroup>
          <MailEditorWrapper>
            <EditorCK
              insertItems={EMAIL_CONTENT}
              content={this.state.content}
              onChange={this.onEditorChange}
              height={300}
            />
          </MailEditorWrapper>
        </FormGroup>

        {this.renderAttachments()}
        {this.renderButtons(values, isSubmitted)}
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default MailForm;
