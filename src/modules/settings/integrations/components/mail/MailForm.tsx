import { SmallLoader } from 'modules/common/components/ButtonMutate';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import { Label } from 'modules/common/components/form/styles';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import EditorCK from 'modules/common/containers/EditorCK';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert, uploadHandler } from 'modules/common/utils';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import { Meta } from 'modules/inbox/components/conversationDetail/workarea/mail/style';
import { FileName } from 'modules/inbox/styles';
import { IMail } from 'modules/inbox/types';
import { IIntegration } from 'modules/settings/integrations/types';
import React, { ReactNode } from 'react';
import { MAIL_TOOLBARS_CONFIG } from '../../constants';
import { formatObj, formatStr } from '../../containers/utils';
import {
  AttachmentContainer,
  Attachments,
  Column,
  ControlWrapper,
  // LeftSection,
  EditorFooter,
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
  kind: string;
  fromEmail?: string;
  mailData?: IMail;
  isReply?: boolean;
  closeModal?: () => void;
  toggleReply?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
  content: string;
  integrations: IIntegration[];
  attachments: any[];
  fileIds: string[];
  totalFileSize: number;
  isUploading: boolean;
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const mailData = props.mailData || ({} as IMail);

    const to = formatObj(mailData.to);
    const cc = formatObj(mailData.cc || []);
    const bcc = formatObj(mailData.bcc || []);
    const [from] = mailData.from || [{}];

    this.state = {
      cc,
      bcc,
      to,

      hasCc: cc ? cc.length > 0 : false,
      hasBcc: bcc ? bcc.length > 0 : false,
      hasSubject: !props.isReply,

      fromEmail: from.email || props.fromEmail,
      from: this.getIntegrationId(props.integrations, props.integrationId),
      subject: mailData.subject || '',
      content: '',

      status: 'draft',
      isUploading: false,

      attachments: [],
      fileIds: [],
      totalFileSize: 0,

      integrations: props.integrations
    };
  }

  getIntegrationId = (integrations, integrationId?: string) => {
    if (integrationId) {
      return integrationId;
    }

    return integrations.length > 0 ? integrations[0]._id : '';
  };

  generateDoc = (values: {
    to: string;
    cc: string;
    bcc: string;
    subject: string;
  }) => {
    const { integrationId, kind } = this.props;
    const mailData = this.props.mailData || ({} as IMail);
    const { to, cc, bcc, subject } = values;
    const { content, from, attachments } = this.state;
    const { references, headerId, threadId, messageId } = mailData;

    const doc = {
      headerId,
      references,
      threadId,
      replyToMessageId: messageId,
      to: formatStr(to),
      cc: formatStr(cc),
      bcc: formatStr(bcc),
      from: integrationId ? integrationId : from,
      subject: subject || mailData.subject,
      attachments,
      kind,
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

  onChange = e => {
    this.setState({ from: e.currentTarget.value });
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

    const extraFormData = [
      { key: 'kind', value: 'nylas' },
      { key: 'erxesApiId', value: this.props.integrationId || from || '' }
    ];

    uploadHandler({
      files,
      extraFormData,

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

  renderFromOption() {
    const { integrations } = this.props;

    return integrations.map(({ _id, name }) => (
      <option key={_id} value={_id}>
        {name}
      </option>
    ));
  }

  renderFrom(formProps: IFormProps, integrationId?: string) {
    return (
      <FlexRow>
        <label>From:</label>
        <FormControl
          {...formProps}
          name="from"
          onChange={this.onChange}
          componentClass="select"
          required={true}
          defaultValue={this.state.from}
          disabled={integrationId ? integrationId.length > 0 : false}
        >
          <option />
          {this.renderFromOption()}
        </FormControl>
      </FlexRow>
    );
  }

  renderTo(formProps: IFormProps, sender: string) {
    return (
      <FlexRow>
        <label>To:</label>
        <FormControl
          {...formProps}
          defaultValue={sender}
          name="to"
          required={true}
        />
      </FlexRow>
    );
  }

  renderCC(formProps: IFormProps) {
    const { cc, hasCc } = this.state;

    if (!hasCc) {
      return null;
    }

    return (
      <FlexRow>
        <label>Cc:</label>
        <FormControl
          autoFocus={true}
          {...formProps}
          name="cc"
          defaultValue={cc}
        />
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
        <FormControl
          autoFocus={true}
          {...formProps}
          name="bcc"
          defaultValue={bcc}
        />
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
              <div>
                ({Math.round(attachment.size / 1000)}
                kB)
              </div>
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
    return (
      <Tip text={__(text)} placement="bottom">
        <Label>
          <Icon icon={icon} onClick={onClick} />
          {element}
        </Label>
      </Tip>
    );
  };

  renderButtons(values, isSubmitted) {
    const { kind, closeModal, toggleReply, renderButton } = this.props;

    const inputProps = {
      type: 'file',
      multiple: true,
      onChange: kind.includes('nylas')
        ? this.onAttachment
        : this.handleFileInput
    };

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
            renderButton({
              name: 'mailForm',
              values: this.generateDoc(values),
              callback: closeModal || toggleReply,
              isSubmitted
            })
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
          autoFocus={true}
          autoGrow={true}
          autoGrowMinHeight={120}
        />
      </MailEditorWrapper>
    );
  }

  renderLeftSide(formProps: IFormProps) {
    const { integrationId } = this.props;
    const sender = this.getEmailSender(this.state.fromEmail);

    return (
      <Column>
        {this.renderFrom(formProps, integrationId)}
        {this.renderTo(formProps, sender)}
        {this.renderCC(formProps)}
        {this.renderBCC(formProps)}
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

  renderMeta = (formProps: IFormProps) => {
    return (
      <Meta>
        <SpaceBetweenRow>
          {this.renderLeftSide(formProps)}
          {this.renderRightSide()}
        </SpaceBetweenRow>
      </Meta>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <ControlWrapper>
        {this.renderMeta(formProps)}
        {this.renderSubject(formProps)}
        {this.renderBody()}
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
