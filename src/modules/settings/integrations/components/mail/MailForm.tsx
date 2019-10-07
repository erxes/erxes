import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import Icon from 'modules/common/components/Icon';
import Spinner from 'modules/common/components/Spinner';
import Tip from 'modules/common/components/Tip';
import EditorCK from 'modules/common/containers/EditorCK';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import { FileName } from 'modules/inbox/styles';
import { IIntegration } from 'modules/settings/integrations/types';
import React from 'react';
import { formatStr } from '../../containers/utils';
import {
  AttachmentContainer,
  Attachments,
  ControlWrapper,
  EditorFooter,
  // LeftSection,
  MailEditorWrapper,
  Resipients,
  Uploading,
  SpaceBetweenRow,
  ToolBar,
  Column
} from './styles';
import { Meta } from 'modules/inbox/components/conversationDetail/workarea/mail/style';
import { IMail } from 'modules/inbox/types';
import { FlexRow, Subject } from './styles';

type Props = {
  integrationId?: string;
  integrations: IIntegration[];
  platform?: string;
  kind: string;
  isReply?: boolean;
  fromEmail?: string;
  conversationDetails?: IMail;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  status?: string;
  cc?: any;
  bcc?: any;
  to?: any;
  fromEmail?: string;
  from?: string;
  subject?: string;
  hasCc?: boolean;
  hasBcc?: boolean;
  hasSubject?: boolean;
  isReply: boolean;
  content: string;
  integrations: IIntegration[];
  attachments: any[];
  totalFileSize: number;
  isUploading: boolean;
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      fromEmail = '',
      conversationDetails = {} as IMail,
      integrations
    } = props;
    const { to, cc, bcc, from } = this.getEmails(conversationDetails);

    this.state = {
      cc: cc || '',
      bcc: bcc || '',
      to: to || '',
      hasCc: cc ? cc.length > 0 : false,
      hasBcc: bcc ? bcc.length > 0 : false,
      hasSubject: bcc ? bcc.length > 0 : false,
      fromEmail: from || fromEmail,
      subject: conversationDetails.subject || '',
      content: '',
      isReply: props.isReply || false,
      status: 'draft',
      isUploading: false,
      from: '',
      attachments: [],
      totalFileSize: 0,
      integrations
    };
  }

  getEmails(details: IMail) {
    const to = details.to || [];
    const cc = details.cc || [];
    const bcc = details.bcc || [];

    const [from] = details.from;

    const emails = {} as {
      to: string;
      from: string;
      cc?: string;
      bcc?: string;
    };

    emails.to = to.map(t => t.email).join(' ');
    emails.from = from.email;

    if (cc.length > 0) {
      emails.cc = cc.map(c => c.email).join(',');
    }

    if (bcc.length > 0) {
      emails.bcc = bcc.map(c => c.email).join(',');
    }

    return emails;
  }

  generateDoc = (values: {
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    from: string;
  }) => {
    const {
      integrationId,
      kind,
      platform,
      conversationDetails = {} as IMail
    } = this.props;
    const { to, cc, bcc, from, subject } = values;
    const { content, attachments } = this.state;
    const { references, headerId, threadId, messageId } =
      conversationDetails || ({} as IMail);

    const doc = {
      headerId,
      references,
      threadId,
      replyToMessageId: messageId,
      to: formatStr(to),
      cc: formatStr(cc),
      bcc: formatStr(bcc),
      from: integrationId ? integrationId : from,
      subject: subject || conversationDetails.subject,
      attachments,
      kind: platform ? platform : kind,
      body: content,
      erxesApiId: from
    };

    return doc;
  };

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onClick = <T extends keyof State>(name: T) => {
    this.setState(({ [name]: true } as unknown) as Pick<State, keyof State>);
  };

  onRemoveAttach = (attachment: any) => {
    const { attachments } = this.state;

    this.setState({
      attachments: attachments.filter(
        item => item.filename !== attachment.filename
      )
    });
  };

  getEmailSender = (fromEmail?: string) => {
    const { conversationDetails = {} as IMail } = this.props;

    const { integrationEmail } = conversationDetails;
    const { to } = this.getEmails(conversationDetails);

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
    const { cc, hasCc } = this.state;

    if (!hasCc) {
      return null;
    }

    return (
      <FlexRow>
        <label>Cc:</label>
        <FormControl {...formProps} name="cc" defaultValue={cc} />
      </FlexRow>
    );
  }

  renderBCC(formProps: IFormProps) {
    const { bcc, hasBcc } = this.state;

    if (!hasBcc) {
      return null;
    }

    return (
      <FlexRow>
        <label>Bcc:</label>
        <FormControl {...formProps} name="bcc" defaultValue={bcc} />
      </FlexRow>
    );
  }

  renderSubject(formProps) {
    const { subject, hasSubject } = this.state;

    if (!hasSubject) {
      return null;
    }

    return (
      <Subject>
        <FlexRow>
          <label>Subject:</label>
          <FormControl
            {...formProps}
            name="subject"
            required={true}
            defaultValue={subject}
            disabled={(subject && true) || false}
          />
        </FlexRow>
      </Subject>
    );
  }

  renderAttachments() {
    const { attachments, isUploading } = this.state;

    if (attachments.length === 0) {
      return;
    }

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
    const onClick = () => this.setState({ isReply: false });

    return (
      <EditorFooter>
        <SpaceBetweenRow>
          <ToolBar>
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
            <Tip text={__('Delete')}>
              <label onClick={onClick}>
                <Icon icon="trash" />
              </label>
            </Tip>
          </ToolBar>
          {renderButton({
            name: 'mailForm',
            values: this.generateDoc(values),
            callback: closeModal,
            isSubmitted
          })}
        </SpaceBetweenRow>
      </EditorFooter>
    );
  }

  renderBody() {
    return (
      <MailEditorWrapper>
        <EditorCK
          insertItems={EMAIL_CONTENT}
          content={this.state.content}
          onChange={this.onEditorChange}
          height={100}
        />
      </MailEditorWrapper>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <ControlWrapper>
        {this.renderBody()}
        {this.renderAttachments()}
        {this.renderButtons(values, isSubmitted)}
      </ControlWrapper>
    );
  };

  renderLeftSide(formProps: IFormProps) {
    const { integrationId } = this.props;
    const { fromEmail } = this.state;
    const sender = this.getEmailSender(fromEmail);

    return (
      <Column>
        <FlexRow>
          <label>From:</label>
          <FormControl
            required={true}
            defaultValue={integrationId}
            disabled={integrationId ? integrationId.length > 0 : false}
            componentClass="select"
            {...formProps}
            name="from"
          >
            <option />
            {this.renderFromOption()}
          </FormControl>
        </FlexRow>
        <FlexRow>
          <label>To:</label>
          <FormControl
            {...formProps}
            defaultValue={sender}
            name="to"
            required={true}
          />
        </FlexRow>
        {this.renderCC(formProps)}
        {this.renderBCC(formProps)}
      </Column>
    );
  }

  renderRightSide(formProps: IFormProps) {
    const { hasCc, hasBcc, hasSubject } = this.state;

    const onClickHasCc = () => this.onClick('hasCc');
    const onClickHasBCC = () => this.onClick('hasBcc');
    const onClickSubject = () => this.onClick('hasSubject');

    return (
      <>
        <Resipients onClick={onClickHasCc} isActive={hasCc}>
          Cc
        </Resipients>
        <Resipients onClick={onClickHasBCC} isActive={hasBcc}>
          Bcc
        </Resipients>
        <Resipients onClick={onClickSubject} isActive={hasSubject}>
          Subject
        </Resipients>
      </>
    );
  }

  renderFormContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <ControlWrapper>
        <Meta>
          <SpaceBetweenRow>
            {this.renderLeftSide(formProps)}
            {this.renderRightSide(formProps)}
          </SpaceBetweenRow>
        </Meta>
        {this.renderSubject(formProps)}
        {this.renderBody()}
        {this.renderButtons(values, isSubmitted)}
      </ControlWrapper>
    );
  };

  render() {
    return <Form renderContent={this.renderFormContent} />;
  }
}

export default MailForm;
