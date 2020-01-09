import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import { SmallLoader } from 'modules/common/components/ButtonMutate';
import FormControl from 'modules/common/components/form/Control';
import { Label } from 'modules/common/components/form/styles';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import EditorCK from 'modules/common/containers/EditorCK';
import { __, Alert, uploadHandler } from 'modules/common/utils';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import { Meta } from 'modules/inbox/components/conversationDetail/workarea/mail/style';
import { FileName } from 'modules/inbox/styles';
import { IMail } from 'modules/inbox/types';
import { IBrand } from 'modules/settings/brands/types';
import { IEmailSignature } from 'modules/settings/email/types';
import { IIntegration } from 'modules/settings/integrations/types';
import React, { ReactNode } from 'react';
import { MAIL_TOOLBARS_CONFIG } from '../../constants';
import {
  formatObj,
  formatStr,
  generateForwardMailContent
} from '../../containers/utils';

import MailChooser from './MailChooser';
import {
  AttachmentContainer,
  Attachments,
  Column,
  ControlWrapper,
  // LeftSection,
  EditorFooter,
  FileSize,
  MailEditorWrapper,
  Resipients,
  SpaceBetweenRow,
  ToolBar,
  Uploading
} from './styles';
import { FlexRow, Subject } from './styles';

type Props = {
  integrationId?: string;
  integrations: IIntegration[];
  fromEmail?: string;
  mailData?: IMail;
  isReply?: boolean;
  isForward?: boolean;
  replyAll?: boolean;
  brandId?: string;
  closeModal?: () => void;
  toggleReply?: () => void;
  emailSignatures: IEmailSignature[];
  createdAt?: Date;
  sendMail: (
    { variables, callback }: { variables: any; callback: () => void }
  ) => void;
};

type State = {
  status?: string;
  cc?: string;
  bcc?: string;
  to?: string;
  fromEmail?: string;
  from?: string;
  subject?: string;
  hasCc?: boolean;
  hasBcc?: boolean;
  hasSubject?: boolean;
  kind: string;
  content: string;
  isLoading: boolean;
  integrations: IIntegration[];
  attachments: any[];
  fileIds: string[];
  totalFileSize: number;
  isUploading: boolean;
  emailSignature: string;
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { replyAll, mailData = {} as IMail } = props;

    const cc = replyAll ? formatObj(mailData.cc || []) : '';
    const bcc = replyAll ? formatObj(mailData.bcc || []) : '';

    const [from] = mailData.from || [{}];
    const sender = this.getEmailSender(from.email || props.fromEmail);

    const fromId = this.getIntegrationId(
      props.integrations,
      props.integrationId
    );

    const emailSignature = this.getEmailSignature(props.brandId);

    this.state = {
      cc,
      bcc,
      to: props.isForward ? '' : sender,

      hasCc: cc ? cc.length > 0 : false,
      hasBcc: bcc ? bcc.length > 0 : false,
      hasSubject: !props.isReply,

      isLoading: false,

      fromEmail: sender,
      from: fromId,
      subject: mailData.subject || '',
      emailSignature,
      content: this.getContent(mailData, emailSignature),

      status: 'draft',
      isUploading: false,
      kind: this.getSelectedIntegration(fromId).kind || '',

      attachments: [],
      fileIds: [],
      totalFileSize: 0,

      integrations: props.integrations
    };
  }

  getContent(mailData: IMail, emailSignature) {
    const { createdAt, isForward } = this.props;

    if (!isForward) {
      return `<p>&nbsp;</p><p>&nbsp;</p> ${emailSignature}`;
    }

    const {
      from = [],
      to = [],
      cc = [],
      bcc = [],
      subject = '',
      body = ''
    } = mailData;

    const [{ email: fromEmail }] = from;

    return generateForwardMailContent({
      fromEmail,
      date: dayjs(createdAt).format('lll'),
      to,
      cc,
      bcc,
      subject,
      body,
      emailSignature
    });
  }

  onSubmit = (e, shouldResolve = false) => {
    const {
      isReply,
      closeModal,
      toggleReply,
      integrationId,
      sendMail,
      isForward
    } = this.props;

    const mailData = this.props.mailData || ({} as IMail);
    const {
      content,
      from,
      attachments,
      to,
      cc,
      bcc,
      subject,
      kind
    } = this.state;

    if (!to) {
      return Alert.error('This message must have at least one recipient.');
    }

    const { references, headerId, threadId, messageId } = mailData;

    this.setState({ isLoading: true });

    const subjectValue = subject || mailData.subject || '';

    const variables = {
      headerId,
      references,
      threadId,
      attachments,
      kind,
      body: content,
      erxesApiId: from,
      shouldResolve,
      ...(!isForward ? { replyToMessageId: messageId } : {}),
      to: formatStr(to),
      cc: formatStr(cc),
      bcc: formatStr(bcc),
      from: integrationId ? integrationId : from,
      subject:
        isForward && !subjectValue.includes('Fw:')
          ? `Fw: ${subjectValue}`
          : subjectValue
    };

    return sendMail({
      variables,
      callback: () => {
        this.setState({ isLoading: false });

        if (isReply) {
          return toggleReply && toggleReply();
        } else {
          return closeModal && closeModal();
        }
      }
    });
  };

  getSelectedIntegration = (selectedId: string) => {
    const integration = this.props.integrations.find(
      obj => obj._id === selectedId
    );

    return integration || ({} as IIntegration);
  };

  changeEditorContent = (content: string, emailSignature: string) => {
    this.setState({ content }, () => {
      this.setState({ emailSignature });
    });
  };

  changeEmailSignature = (selectedIntegrationId: string) => {
    // find selected brand
    const brand = this.getSelectedIntegration(selectedIntegrationId).brand;
    const brandId = brand._id;

    // email signature of selected brand
    const emailSignatureToChange = this.getEmailSignature(brandId);

    // email signature, content before change
    const { emailSignature, content } = this.state;

    if (emailSignature === emailSignatureToChange) {
      return;
    }

    if (content.includes(emailSignature)) {
      return this.changeEditorContent(
        content.replace(emailSignature, emailSignatureToChange),
        emailSignatureToChange
      );
    }

    return this.changeEditorContent(
      content.concat(emailSignatureToChange),
      emailSignatureToChange
    );
  };

  getEmailSignature = (brandId?: string) => {
    if (!brandId) {
      const integrations = this.props.integrations;
      const brand =
        integrations.length > 0 ? integrations[0].brand : ({} as IBrand);

      return this.findEmailSignature(brand._id);
    }

    return this.findEmailSignature(brandId);
  };

  findEmailSignature = (brandId: string) => {
    const found = this.props.emailSignatures.find(
      obj => obj.brandId === brandId
    );

    const signatureContent = (found && found.signature) || '';

    return signatureContent;
  };

  getIntegrationId = (integrations, integrationId?: string) => {
    if (integrationId) {
      return integrationId;
    }

    return integrations.length > 0 ? integrations[0]._id : '';
  };

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onClick = <T extends keyof State>(name: T) => {
    this.setState(({ [name]: true } as unknown) as Pick<State, keyof State>);
  };

  handleInputChange = e => {
    this.setState({ subject: e.currentTarget.value });
  };

  onSelectChange = <T extends keyof State>(name: T, e: any) => {
    this.setState(({ [name]: e.currentTarget.value } as unknown) as Pick<
      State,
      keyof State
    >);
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
    const mailData = this.props.mailData || ({} as IMail);
    const { integrationEmail } = mailData;

    const to = formatObj(mailData.to) || '';

    // new email
    if ((!to || to.length === 0) && !integrationEmail) {
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

  onAttachment = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    const { attachments, from } = this.state;

    uploadHandler({
      kind: 'nylas',
      files,
      extraFormData: [
        { key: 'erxesApiId', value: this.props.integrationId || from || '' }
      ],
      beforeUpload: () => {
        this.setState({ isUploading: true });
      },
      afterUpload: ({ response }) => {
        const resObj = JSON.parse(response);

        this.setState({
          isUploading: false,
          attachments: [...attachments, { ...resObj }]
        });
      }
    });
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

  renderFromValue = () => {
    const { integrations = [], integrationId } = this.props;

    if (integrationId && integrationId.length > 0) {
      const integration = integrations.find(obj => obj._id === integrationId);

      return integration && integration.name;
    }

    const onChangeMail = (from: string) => {
      this.setState({ from, kind: this.getSelectedIntegration(from).kind });

      this.changeEmailSignature(from);
    };

    return (
      <MailChooser
        onChange={onChangeMail}
        integrations={integrations}
        selectedItem={this.state.from}
      />
    );
  };

  renderFrom() {
    return (
      <FlexRow>
        <label>From:</label>
        {this.renderFromValue()}
      </FlexRow>
    );
  }

  renderTo() {
    return (
      <FlexRow>
        <label>To:</label>
        <FormControl
          autoFocus={this.props.isForward}
          defaultValue={this.state.to}
          onChange={this.onSelectChange.bind(this, 'to')}
          name="to"
          required={true}
        />
      </FlexRow>
    );
  }

  renderCC() {
    const { cc, hasCc } = this.state;

    if (!hasCc) {
      return null;
    }

    return (
      <FlexRow>
        <label>Cc:</label>
        <FormControl
          autoFocus={true}
          componentClass="textarea"
          onChange={this.onSelectChange.bind(this, 'cc')}
          name="cc"
          defaultValue={cc}
        />
      </FlexRow>
    );
  }

  renderBCC() {
    const { bcc, hasBcc } = this.state;

    if (!hasBcc) {
      return null;
    }

    return (
      <FlexRow>
        <label>Bcc:</label>
        <FormControl
          autoFocus={true}
          onChange={this.onSelectChange.bind(this, 'bcc')}
          componentClass="textarea"
          name="bcc"
          defaultValue={bcc}
        />
      </FlexRow>
    );
  }

  renderSubject() {
    const { subject, hasSubject } = this.state;

    if (!hasSubject) {
      return null;
    }

    return (
      <Subject>
        <FlexRow>
          <label>Subject:</label>
          <FormControl
            name="subject"
            onChange={this.handleInputChange}
            required={true}
            defaultValue={subject}
            disabled={this.props.isReply}
            autoFocus={true}
          />
        </FlexRow>
      </Subject>
    );
  }

  renderAttachments() {
    const { attachments } = this.state;

    if (attachments.length === 0) {
      return;
    }

    return (
      <Attachments>
        {attachments.map((attachment, index) => (
          <AttachmentContainer key={index}>
            <FileName>{attachment.filename || attachment.name}</FileName>
            {attachment.size ? (
              <FileSize>
                ({Math.round(attachment.size / 1000)}
                kB)
              </FileSize>
            ) : null}
            <Icon
              icon="times-circle"
              size={14}
              onClick={this.onRemoveAttach.bind(this, attachment)}
            />
          </AttachmentContainer>
        ))}
      </Attachments>
    );
  }

  renderIcon = ({
    text,
    icon,
    element,
    onClick
  }: {
    text: string;
    icon: string;
    element?: ReactNode;
    onClick?: () => void;
  }) => {
    if (!onClick && !element) {
      return null;
    }

    return (
      <Tip text={__(text)} placement="top">
        <Label>
          <Icon icon={icon} onClick={onClick} />
          {element}
        </Label>
      </Tip>
    );
  };

  renderSubmit(label, onClick, type: string, icon = 'message') {
    const { isLoading } = this.state;

    return (
      <Button
        onClick={onClick}
        btnStyle={type}
        size="small"
        icon={isLoading ? undefined : icon}
        disabled={isLoading}
      >
        {isLoading && <SmallLoader />}
        {label}
      </Button>
    );
  }

  renderButtons() {
    const { kind } = this.state;
    const { isReply, toggleReply } = this.props;

    const inputProps = {
      type: 'file',
      multiple: true,
      onChange: kind.includes('nylas')
        ? this.onAttachment
        : this.handleFileInput
    };

    const onSubmitResolve = () => this.onSubmit(true);

    return (
      <EditorFooter>
        <SpaceBetweenRow>
          <ToolBar>
            {this.renderIcon({
              text: 'Attach file',
              icon: 'paperclip',
              element: <input {...inputProps} />
            })}
            {this.renderIcon({
              text: 'Delete',
              icon: 'trash-alt',
              onClick: toggleReply
            })}
          </ToolBar>
          {this.state.isUploading ? (
            <Uploading>
              <SmallLoader />
              <span>Uploading...</span>
            </Uploading>
          ) : (
            <div>
              {this.renderSubmit('Send', this.onSubmit, 'primary')}
              {isReply &&
                this.renderSubmit(
                  'Send and Resolve',
                  onSubmitResolve,
                  'success',
                  'check-circle'
                )}
            </div>
          )}
        </SpaceBetweenRow>
      </EditorFooter>
    );
  }

  renderBody() {
    return (
      <MailEditorWrapper>
        <EditorCK
          insertItems={EMAIL_CONTENT}
          toolbar={MAIL_TOOLBARS_CONFIG}
          removePlugins="elementspath"
          content={this.state.content}
          onChange={this.onEditorChange}
          toolbarLocation="bottom"
          autoFocus={!this.props.isForward}
          autoGrow={true}
          autoGrowMinHeight={120}
        />
      </MailEditorWrapper>
    );
  }

  renderLeftSide() {
    return (
      <Column>
        {this.renderFrom()}
        {this.renderTo()}
        {this.renderCC()}
        {this.renderBCC()}
      </Column>
    );
  }

  renderRightSide() {
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

  renderMeta = () => {
    return (
      <Meta>
        <SpaceBetweenRow>
          {this.renderLeftSide()}
          {this.renderRightSide()}
        </SpaceBetweenRow>
      </Meta>
    );
  };

  render() {
    return (
      <ControlWrapper>
        {this.renderMeta()}
        {this.renderSubject()}
        {this.renderBody()}
        {this.renderAttachments()}
        {this.renderButtons()}
      </ControlWrapper>
    );
  }
}

export default MailForm;
