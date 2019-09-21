import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Spinner from 'modules/common/components/Spinner';
import Tip from 'modules/common/components/Tip';
import EditorCK from 'modules/common/containers/EditorCK';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import { FileName } from 'modules/inbox/styles';
import {
  IGmailAttachment,
  IIntegration
} from 'modules/settings/integrations/types';
import React from 'react';
import strip from 'strip';
import { formatStr } from '../../containers/utils';
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
  headerId?: string;
  threadId?: string;
  subject?: string;
  references?: string;
  fromEmail?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  integrationEmail?: string;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  status?: string;
  cc?: any;
  bcc?: any;
  fromEmail?: string;
  from?: string;
  subject?: string;
  isCc?: boolean;
  isBcc?: boolean;
  content: string;
  integrations: IIntegration[];
  attachments: any[];
  totalFileSize: number;
  isUploading: boolean;
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { cc, bcc } = props;

    this.state = {
      fromEmail: props.fromEmail || '',
      cc: cc || '',
      bcc: bcc || '',
      isCc: cc ? cc.length > 0 : false,
      isBcc: bcc ? bcc.length > 0 : false,

      status: 'draft',
      isUploading: false,
      content: '',
      from: '',
      subject: props.subject || '',
      attachments: [],
      totalFileSize: 0,
      integrations: props.integrations
    };
  }

  generateDoc = (values: {
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    from: string;
  }) => {
    const { headerId, threadId, references } = this.props;
    const { content, attachments } = this.state;
    const { to, cc, bcc, from, subject } = values;

    const doc = {
      headerId,
      threadId,
      to: formatStr(to),
      cc: formatStr(cc),
      bcc: formatStr(bcc),
      subject,
      from,
      attachments,
      textHtml: content,
      textPlain: strip(content),
      erxesApiId: from,
      references
    };

    return doc;
  };

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onClick = <T extends keyof State>(name: T) => {
    this.setState(({ [name]: true } as unknown) as Pick<State, keyof State>);
  };

  onRemoveAttach = (attachment: IGmailAttachment) => {
    const { attachments } = this.state;

    this.setState({
      attachments: attachments.filter(
        item => item.filename !== attachment.filename
      )
    });
  };

  getEmailSender = (fromEmail?: string) => {
    const { to = '', integrationEmail } = this.props;

    // new email
    if (!to && !integrationEmail) {
      return fromEmail;
    }

    // reply
    if (!integrationEmail || !fromEmail) {
      return '';
    }

    let receiver;

    // Prevent send email to itself
    if (integrationEmail === fromEmail) {
      receiver = to;
    } else {
      let toEmails;

      // Exclude integration email from [to]
      if (to.includes(integrationEmail)) {
        toEmails = to.split(' ').filter(email => email !== integrationEmail);
      } else {
        toEmails = to;
      }

      receiver = toEmails + ' ' + fromEmail;
    }

    return receiver;
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

      // eslint-disable-next-line
      uploadReader.onloadend = () => {
        const totalFileSize = this.state.totalFileSize + fileInfo.size;

        if (totalFileSize > 5184000) {
          this.setState({ isUploading: false });

          return Alert.error('It`s size exceeds the limit 5mb');
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
            this.setState({ isUploading: false });
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
    const { cc, isCc } = this.state;

    if (!isCc) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Cc:</ControlLabel>
        <FormControl {...formProps} name="cc" defaultValue={cc} />
      </FormGroup>
    );
  }

  renderBCC(formProps: IFormProps) {
    const { bcc, isBcc } = this.state;

    if (!isBcc) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Bcc:</ControlLabel>
        <FormControl {...formProps} name="bcc" defaultValue={bcc} />
      </FormGroup>
    );
  }

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
    const { integrationId } = this.props;
    const { fromEmail, isBcc, isCc, content, subject } = this.state;

    const sender = this.getEmailSender(fromEmail);

    const onClickIsCC = () => this.onClick('isCc');
    const onClickIsBCC = () => this.onClick('isBcc');

    return (
      <ControlWrapper>
        <FormGroup>
          <ControlLabel required={true}>To:</ControlLabel>
          <FormControl
            {...formProps}
            defaultValue={sender}
            name="to"
            required={true}
          />
        </FormGroup>

        <LeftSection>
          <Resipients onClick={onClickIsCC} isActive={isCc}>
            Cc
          </Resipients>
          <Resipients onClick={onClickIsBCC} isActive={isBcc}>
            Bcc
          </Resipients>
        </LeftSection>

        {this.renderCC(formProps)}
        {this.renderBCC(formProps)}

        <FormGroup>
          <ControlLabel required={true}>From:</ControlLabel>
          <FormControl
            required={true}
            defaultValue={integrationId || ''}
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
          <FormControl
            {...formProps}
            name="subject"
            required={true}
            defaultValue={subject}
            disabled={(subject && true) || false}
          />
        </FormGroup>

        <FormGroup>
          <MailEditorWrapper>
            <EditorCK
              insertItems={EMAIL_CONTENT}
              content={content}
              onChange={this.onEditorChange}
              height={300}
            />
          </MailEditorWrapper>
        </FormGroup>

        {this.renderAttachments()}
        {this.renderButtons(values, isSubmitted)}
      </ControlWrapper>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default MailForm;
