import { Alert, __ } from '@erxes/ui/src/utils';
import {
  ControlWrapper,
  EditorFooter,
  MailEditorWrapper,
  Resipients,
  ShowReplies,
  ShowReplyButtonWrapper,
  SpaceBetweenRow,
  ToolBar,
  UploaderWrapper
} from './styles';
import { FlexRow, Subject } from './styles';
import { IEmail, IMail, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import React, { ReactNode } from 'react';
import {
  formatObj,
  formatStr,
  generateForwardMailContent,
  generatePreviousContents
} from '../../containers/utils';

import Button from '@erxes/ui/src/components/Button';
import { Column } from '@erxes/ui/src/styles/main';
import EditorCK from '@erxes/ui/src/containers/EditorCK';
import EmailTemplate from './emailTemplate/EmailTemplate';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IEmailSignature } from '@erxes/ui/src/auth/types';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Label } from '@erxes/ui/src/components/form/styles';
import { MAIL_TOOLBARS_CONFIG } from '@erxes/ui/src/constants/integrations';
import MailChooser from './MailChooser';
import { Meta } from './styles';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import { generateEmailTemplateParams } from '@erxes/ui-engage/src/utils';
import Uploader from '@erxes/ui/src/components/Uploader';
import { isEnabled, readFile } from '@erxes/ui/src/utils/core';

type Props = {
  emailTemplates: any[] /*change type*/;
  currentUser: IUser;
  fromEmail?: string;
  mailData?: IMail;
  clearOnSubmit?: boolean;
  isReply?: boolean;
  isForward?: boolean;
  replyAll?: boolean;
  brandId?: string;
  mails?: IMessage[];
  messageId?: string;
  totalCount?: number;
  closeModal?: () => void;
  toggleReply?: () => void;
  emailSignatures: IEmailSignature[];
  fetchMoreEmailTemplates: (page: number) => void;
  createdAt?: Date;
  sendMail: ({
    variables,
    callback
  }: {
    variables: any;
    callback: () => void;
  }) => void;
  verifiedImapEmails: string[];
  verifiedEngageEmails: string[];
  history: any;
  shrink?: boolean;
  clear?: boolean;
};

type State = {
  status?: string;
  templateId: string;
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
  attachments: any[];
  fileIds: string[];
  showPrevEmails: boolean;
  emailSignature: string;
  name: string;
  showReply: string;
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { isForward, replyAll, mailData = {} as IMail } = props;

    const mailWidget = JSON.parse(localStorage.getItem('emailWidgetData'));

    const cc = replyAll
      ? formatObj(mailData.cc || [])
      : mailWidget
      ? mailWidget.cc
      : '';

    const bcc = replyAll
      ? formatObj(mailData.bcc || [])
      : mailWidget
      ? mailWidget.bcc
      : '';

    const [from] = mailData.from || ([{}] as IEmail[]);
    const sender =
      this.getEmailSender(from.email || props.fromEmail) || mailWidget?.to;

    const to = mailWidget ? mailWidget.to : isForward ? '' : sender;
    const mailKey = `mail_${to || this.props.currentUser._id}`;
    const showPrevEmails =
      (localStorage.getItem(`reply_${mailKey}`) || '').length > 0;

    const attachments =
      isForward && mailData.attachments
        ? mailData.attachments
        : mailWidget
        ? mailWidget.attachments
        : [];

    this.state = {
      cc,
      bcc,
      to,

      templateId: '',

      hasCc: cc ? cc.length > 0 : false,
      hasBcc: bcc ? bcc.length > 0 : false,
      hasSubject: !props.isReply,

      isLoading: false,
      showPrevEmails,

      fromEmail: sender,
      from: mailWidget ? mailWidget.from : mailData.from || ([{}] as IEmail[]),
      subject: mailData.subject || mailWidget ? mailWidget.subject : '',
      emailSignature: '',
      content: mailWidget
        ? mailWidget.content
        : mailData
        ? this.getContent(mailData, '')
        : '',

      status: 'draft',
      kind: '',

      attachments,
      fileIds: [],

      name: `mail_${mailKey}`,
      showReply: `reply_${mailKey}`
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { name, content } = this.state;

    if (prevState.content !== content) {
      localStorage.setItem(name, content);
    }

    if (prevProps.clear !== this.props.clear) {
      this.clearContent();
    }
  }

  componentDidMount() {
    const { name, showPrevEmails } = this.state;

    const content = localStorage.getItem(name);

    if (content && content !== this.state.content) {
      this.setState({ content });
    }

    if ((content || '').length === 0 && showPrevEmails) {
      this.setState({ showPrevEmails: false });
    }
  }

  componentWillUnmount() {
    localStorage.removeItem(this.state.name);
    localStorage.removeItem(this.state.showReply);
  }

  prepareData() {
    const { from, to, cc, bcc, subject, content, attachments } = this.state;

    const variables = {
      from,
      to,
      cc,
      bcc,
      subject,
      content,
      attachments
    };

    localStorage.setItem('emailWidgetData', JSON.stringify(variables));
  }

  getContent(mailData: IMail, emailSignature: string) {
    const { createdAt, isForward } = this.props;

    if (!isForward) {
      return `<p>&nbsp;</p><p>&nbsp;</p> ${emailSignature}<p>&nbsp;</p>`;
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

  getReplies(messageId?: string) {
    const { mails = [] } = this.props;

    if (!messageId) {
      return '';
    }

    let msgIndex = mails.findIndex(mail => {
      if (!mail) {
        return false;
      }

      return mail._id === messageId;
    });

    if (msgIndex === -1) {
      return '';
    }

    msgIndex = msgIndex === 0 ? (msgIndex += 1) : msgIndex;

    const selectedMails = mails.splice(0, msgIndex);

    const previousEmails = selectedMails
      .map(mail => {
        if (!mail.mailData) {
          return [];
        }

        const prevEmailForm = mail.mailData.from || [];
        const [{ email }] = prevEmailForm;

        return {
          fromEmail: email,
          body: mail.mailData.body,
          date: dayjs(mail.createdAt).format('lll')
        };
      })
      .filter(mail => mail);

    const replyContent = generatePreviousContents(previousEmails);

    const updatedContent = `
      ${this.state.content}
      ${replyContent || ''}
    `;

    return updatedContent;
  }

  clearContent = () => {
    this.setState({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      content: '',
      attachments: []
    });

    this.prepareData();
  };

  onShowReplies = () => {
    const { messageId } = this.props;

    this.setState(
      {
        showPrevEmails: true,
        content: this.getReplies(messageId)
      },
      () => {
        localStorage.setItem(this.state.showReply, 'true');
      }
    );
  };

  onSubmit = (_, shouldResolve = false) => {
    const {
      isReply,
      closeModal,
      toggleReply,
      sendMail,
      isForward,
      clearOnSubmit,
      messageId
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

    const { references, headerId, inReplyTo, replyTo, threadId } = mailData;

    this.setState({ isLoading: true });

    const subjectValue = subject || mailData.subject || '';

    const updatedContent =
      isForward || !isReply ? content : this.getReplies(messageId);

    const variables = {
      headerId,
      replyTo,
      inReplyTo,
      references,
      threadId,
      attachments,
      kind,
      body: updatedContent,
      erxesApiId: from,
      shouldResolve,
      ...(!isForward ? { replyToMessageId: mailData.messageId } : {}),
      to: formatStr(to),
      cc: formatStr(cc),
      bcc: formatStr(bcc),
      from,
      subject:
        isForward && !subjectValue.includes('Fw:')
          ? `Fw: ${subjectValue}`
          : subjectValue
    };

    return sendMail({
      variables,
      callback: () => {
        this.setState({ isLoading: false });

        if (clearOnSubmit) {
          this.clearContent();
        }

        if (isReply) {
          return toggleReply && toggleReply();
        } else {
          return closeModal && closeModal();
        }
      }
    });
  };

  changeEditorContent = (content: string, emailSignature: string) => {
    this.setState({ content }, () => {
      this.setState({ emailSignature });
    });
  };

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
    this.prepareData();
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

    this.prepareData();
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
    if (!integrationEmail && !fromEmail) {
      return '';
    }

    if (!integrationEmail && to !== fromEmail) {
      return fromEmail;
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

  findTemplate = id => {
    const template = this.props.emailTemplates.find(t => t._id === id);

    if (template) {
      return template.content;
    }

    return '';
  };

  templateChange = value => {
    this.setState({ content: this.findTemplate(value), templateId: value });
  };

  renderFromValue = () => {
    const { verifiedImapEmails, verifiedEngageEmails } = this.props;

    const onChangeMail = (from: string) => {
      this.setState({ from });
    };

    this.prepareData();

    return (
      <MailChooser
        onChange={onChangeMail}
        integrations={[]}
        selectedItem={this.state.from}
        verifiedImapEmails={verifiedImapEmails}
        verifiedEngageEmails={verifiedEngageEmails}
      />
    );
  };

  renderFrom() {
    return (
      <FlexRow>
        <label className="from">From:</label>
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
          value={this.state.to}
          onChange={this.onSelectChange.bind(this, 'to')}
          name="to"
          required={true}
        />
        {this.renderRightSide()}
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
          value={cc}
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
          value={bcc}
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
            value={subject}
            autoFocus={true}
          />
        </FlexRow>
      </Subject>
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
    const {
      isReply,
      emailTemplates,
      toggleReply,
      totalCount,
      fetchMoreEmailTemplates,
      history
    } = this.props;

    const onSubmitResolve = e => this.onSubmit(e, true);

    const onChangeAttachment = attachments => {
      for (const att of attachments) {
        att.url = readFile(att.url);
      }

      this.setState({ attachments });
    };

    return (
      <EditorFooter>
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
        <ToolBar>
          <Tip text="Attach file" placement="top">
            <UploaderWrapper>
              <Uploader
                defaultFileList={this.state.attachments || []}
                onChange={onChangeAttachment}
                text=" "
                icon="attach"
              />
            </UploaderWrapper>
          </Tip>
          {this.renderIcon({
            text: 'Delete',
            icon: 'trash-alt',
            onClick: toggleReply
          })}
          {isEnabled('emailtemplates') && (
            <EmailTemplate
              onSelect={this.templateChange}
              totalCount={totalCount}
              fetchMoreEmailTemplates={fetchMoreEmailTemplates}
              targets={generateEmailTemplateParams(emailTemplates || [])}
              history={history}
            />
          )}
        </ToolBar>
      </EditorFooter>
    );
  }

  renderShowReplies() {
    const { isReply, isForward } = this.props;

    if (!isReply || isForward || this.state.showPrevEmails) {
      return null;
    }

    return (
      <ShowReplyButtonWrapper>
        <Tip text="Show trimmed content">
          <ShowReplies onClick={this.onShowReplies}>
            <span />
            <span />
            <span />
          </ShowReplies>
        </Tip>
      </ShowReplyButtonWrapper>
    );
  }

  renderBody() {
    return (
      <MailEditorWrapper>
        {this.renderShowReplies()}
        <EditorCK
          toolbar={MAIL_TOOLBARS_CONFIG}
          removePlugins="elementspath"
          content={this.state.content}
          onChange={this.onEditorChange}
          toolbarLocation="bottom"
          autoFocus={!this.props.isForward}
          autoGrow={true}
          autoGrowMinHeight={300}
          autoGrowMaxHeight={300}
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
        <SpaceBetweenRow>{this.renderLeftSide()}</SpaceBetweenRow>
      </Meta>
    );
  };

  renderData = () => {
    if (!this.props.shrink) {
      return (
        <>
          {this.renderMeta()}
          {this.renderSubject()}
          {this.renderBody()}
          {this.renderButtons()}
        </>
      );
    }

    return null;
  };

  render() {
    return <ControlWrapper>{this.renderData()}</ControlWrapper>;
  }
}

export default MailForm;
