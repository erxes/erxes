import { Alert, __ } from '@erxes/ui/src/utils';
import {
  ControlWrapper,
  EditorFooter,
  FieldWrapper,
  MailColumn,
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
  generatePreviousContents,
  getValidEmails
} from '../../containers/utils';
import { isEnabled, readFile } from '@erxes/ui/src/utils/core';

import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import { Column } from '@erxes/ui/src/styles/main';
import EditorCK from '@erxes/ui/src/containers/EditorCK';
import EmailTemplate from '../../containers/mail/EmailTemplate';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IAttachment } from '@erxes/ui/src/types';
import { IEmailSignature } from '@erxes/ui/src/auth/types';
import { IEmailTemplate } from '../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Label } from '@erxes/ui/src/components/form/styles';
import { MAIL_TOOLBARS_CONFIG } from '@erxes/ui/src/constants/integrations';
import MailChooser from './MailChooser';
import { Meta } from './styles';
import SignatureChooser from './SignatureChooser';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Tip from '@erxes/ui/src/components/Tip';
import Uploader from '@erxes/ui/src/components/Uploader';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import dayjs from 'dayjs';
import { generateEmailTemplateParams } from '@erxes/ui-engage/src/utils';
import MailSuggestion from './MailSuggestion';
import Recipients from './Recipients';

const Signature = asyncComponent(() =>
  import(
    /* webpackChunkName:"Signature" */ '@erxes/ui-settings/src/email/containers/Signature'
  )
);

type Props = {
  emailTemplates: IEmailTemplate[] /*change type*/;
  currentUser: IUser;
  fromEmail?: string;
  emailTo?: string;
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
  isEmptyEmail?: boolean;
  loading?: boolean;
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
  conversationStatus?: string;
  brands?: any[];
  contacts: any[];
  searchContacts: (value: string) => void;
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
  loading?: boolean;
  kind: string;
  content: string;
  isSubmitLoading: boolean;
  isSubmitResolveLoading: boolean;
  attachments: any[];
  fileIds: string[];
  showPrevEmails: boolean;
  emailSignature: string;
  name: string;
  showReply: string;
  isRepliesRetrieved: boolean;
  focusedField: string;
  contatcs: any[];
  selectedMailIndex: number;
  toCollection: any[];
  ccCollection: any[];
  bccCollection: any[];
  contacts: any[];
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { isForward, replyAll, mailData = {} as IMail, emailTo } = props;

    const mailWidget = JSON.parse(
      localStorage.getItem('emailWidgetData') || '{}'
    );

    const cc = replyAll
      ? formatObj(mailData.cc || [])
      : mailWidget
      ? mailWidget.cc
      : '' || '';

    const bcc = replyAll
      ? formatObj(mailData.bcc || [])
      : mailWidget
      ? mailWidget.bcc
      : '' || '';

    const [from] = mailData.from || ([{}] as IEmail[]);
    const sender =
      this.getEmailSender(from.email || props.fromEmail) || mailWidget?.to;

    const to = emailTo
      ? emailTo
      : mailWidget
      ? mailWidget.to
      : isForward
      ? ''
      : sender || '';
    const mailKey = `mail_${to || this.props.currentUser._id}`;
    const showPrevEmails =
      (localStorage.getItem(`reply_${mailKey}`) || '').length > 0;

    const attachments =
      isForward && mailData.attachments
        ? mailData.attachments
        : mailWidget
        ? mailWidget.attachments
        : [] || [];

    this.state = {
      cc,
      bcc,
      to,

      templateId: '',

      hasCc: cc ? cc.length > 0 : false,
      hasBcc: bcc ? bcc.length > 0 : false,
      hasSubject: !props.isReply,

      isSubmitLoading: false,
      isSubmitResolveLoading: false,
      showPrevEmails,

      fromEmail: sender,
      from: mailWidget ? mailWidget.from : mailData.from || ([{}] as IEmail[]),
      subject: mailData.subject || mailWidget ? mailWidget.subject : '',
      emailSignature: '',
      content: mailData
        ? this.getContent(mailData, '')
        : mailWidget
        ? mailWidget.content
        : '',

      status: 'draft',
      kind: '',

      attachments,
      fileIds: [],

      name: `mail_${mailKey}`,
      showReply: `reply_${mailKey}`,

      isRepliesRetrieved: false,
      focusedField: '',
      contatcs: [],
      selectedMailIndex: 0,
      toCollection: [],
      ccCollection: [],
      bccCollection: [],
      contacts: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { name, content } = this.state;
    const { isEmptyEmail, clear, emailTo, contacts } = this.props;

    if (prevState.content !== content) {
      localStorage.setItem(name, content);
    }

    if (prevProps.clear !== clear || prevProps.isEmptyEmail !== isEmptyEmail) {
      this.clearContent();
    }

    if (prevProps.emailTo !== emailTo) {
      this.setState({
        toCollection: [{ primaryEmail: emailTo }]
      });
    }

    if (prevProps.contacts !== contacts) {
      this.setState({
        contacts: contacts
      });
    }
  }

  componentDidMount() {
    const { name, showPrevEmails } = this.state;

    const content = localStorage.getItem(name);

    if (content && content !== this.state.content) {
      this.setState({ content: '' });
    }

    if ((content || '').length === 0 && showPrevEmails) {
      this.setState({ showPrevEmails: false });
    }
  }

  componentWillUnmount() {
    localStorage.removeItem(this.state.name);
    localStorage.removeItem(this.state.showReply);
  }

  formatInputFields(fieldName) {
    const field = this.state[fieldName];
    const fieldCollection = this.state[`${fieldName}Collection`];

    getValidEmails(field).map(mail => {
      this.setState(
        prevState =>
          (({
            [`${fieldName}Collection`]: !fieldCollection.some(
              collection => collection.primaryEmail === mail
            )
              ? prevState[`${fieldName}Collection`].concat(
                  this.state.contacts.length !== 0
                    ? [...this.props.contacts]
                    : { primaryEmail: mail }
                )
              : prevState[`${fieldName}Collection`],
            [fieldName]: ''
          } as unknown) as Pick<State, keyof State>)
      );
    });
  }

  prepareData() {
    const {
      from,
      to,
      cc,
      bcc,
      subject,
      content,
      attachments,
      toCollection,
      ccCollection,
      bccCollection
    } = this.state;

    const variables = {
      from,
      to: [...toCollection.map(mail => mail.primaryEmail), to].join(', '),
      cc: [...ccCollection.map(mail => mail.primaryEmail), cc].join(', '),
      bcc: [...bccCollection.map(mail => mail.primaryEmail), bcc].join(', '),
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

    const { isRepliesRetrieved } = this.state;
    this.setState({ isRepliesRetrieved: !isRepliesRetrieved });

    if (!messageId) {
      return '';
    }

    const selectedMails = mails.filter(mail => {
      if (!mail) {
        return false;
      }

      return mail._id === messageId;
    });

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
      to: this.props.emailTo ? this.props.emailTo : '',
      cc: '',
      bcc: '',
      subject: '',
      content: '',
      attachments: [],
      toCollection: [],
      ccCollection: [],
      bccCollection: []
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
      messageId,
      conversationStatus
    } = this.props;

    const mailData = this.props.mailData || ({} as IMail);
    const {
      content,
      from,
      attachments,
      toCollection,
      ccCollection,
      bccCollection,
      subject,
      kind,
      isRepliesRetrieved
    } = this.state;

    if (toCollection.length === 0) {
      return Alert.warning('This message must have at least one recipient.');
    }

    if (!isReply && (!subject || !content)) {
      return Alert.warning(
        'Send this message with a subject or text in the body.'
      );
    }

    const { references, headerId, inReplyTo, replyTo, threadId } = mailData;

    shouldResolve
      ? this.setState({ isSubmitResolveLoading: true })
      : this.setState({ isSubmitLoading: true });

    const subjectValue = subject || mailData.subject || '';

    const updatedContent =
      isForward || !isReply
        ? content
        : !isRepliesRetrieved
        ? this.getReplies(messageId)
        : content;

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
      shouldResolve:
        shouldResolve && conversationStatus === 'new' ? true : false,
      shouldOpen:
        shouldResolve && conversationStatus === 'closed' ? true : false,
      ...(!isForward ? { replyToMessageId: mailData.messageId } : {}),
      to: toCollection.map(mail => mail.primaryEmail),
      cc: ccCollection.map(mail => mail.primaryEmail),
      bcc: bccCollection.map(mail => mail.primaryEmail),
      from,
      subject:
        isForward && !subjectValue.includes('Fw:')
          ? `Fw: ${subjectValue}`
          : subjectValue
    };

    return sendMail({
      variables,
      callback: () => {
        shouldResolve
          ? this.setState({ isSubmitResolveLoading: true })
          : this.setState({ isSubmitLoading: true });

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
    this.props.searchContacts(e.currentTarget.value);

    e.currentTarget.value.endsWith(',') && this.formatInputFields(name);
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

  onContentChange = content => {
    this.setState({ content });
  };

  onSignatureChange = emailSignature => {
    this.setState({ emailSignature });
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
      <FlexRow isEmail={true}>
        <label className="from">From:</label>
        {this.renderFromValue()}
      </FlexRow>
    );
  }

  getFilteredContacts = (fieldName: string) => {
    const field = this.state[fieldName];
    const { contacts } = this.state;

    if (field?.trim() === '' || contacts?.length === 0) {
      return [];
    }

    return (contacts || [])
      ?.filter(
        contact =>
          !this.state[`${fieldName}Collection`]?.some(
            collection => collection.primaryEmail === contact.primaryEmail
          )
      )
      .slice(0, 5);
  };

  removeRecipient = (index, fieldName) => {
    const field = this.state[`${fieldName}Collection`];
    field.splice(index, 1);
    this.setState(({
      [`${fieldName}Collection`]: [...field]
    } as unknown) as Pick<State, keyof State>);
  };

  handleSuggestionClick = (contact: any, fieldName: string) => {
    this.setState(({
      [fieldName]: '',
      focusInput: fieldName,
      [`${fieldName}Collection`]: [
        ...this.state[`${fieldName}Collection`],
        contact
      ],
      selectedMailIndex: 0,
      contacts: []
    } as unknown) as Pick<State, keyof State>);
  };

  renderTo() {
    const { to, toCollection, selectedMailIndex, focusedField } = this.state;
    const contacts = this.getFilteredContacts('to');

    return (
      <FlexRow isEmail={true}>
        <label>To:</label>
        <FieldWrapper>
          {toCollection?.length !== 0 && (
            <Recipients
              collection={toCollection}
              onClick={index => this.removeRecipient(index, 'to')}
            />
          )}
          <MailColumn>
            <FormControl
              autoFocus={this.props.isForward}
              value={to}
              onChange={this.onSelectChange.bind(this, 'to')}
              name="to"
              required={true}
              autoComplete="off"
              onKeyDown={e => this.handleKeyDown(e, 'to')}
              onFocus={() => this.setState({ focusedField: 'to' })}
              onBlur={() => this.setState({ focusedField: '' })}
            />
            {focusedField === 'to' && (
              <MailSuggestion
                contacts={contacts}
                selectedMailIndex={selectedMailIndex}
                onClick={contact => this.handleSuggestionClick(contact, 'to')}
              />
            )}
          </MailColumn>
        </FieldWrapper>
        {this.renderRightSide()}
      </FlexRow>
    );
  }

  renderCC() {
    const {
      cc,
      ccCollection,
      hasCc,
      selectedMailIndex,
      focusedField
    } = this.state;
    const contacts = this.getFilteredContacts('cc');

    if (!hasCc) {
      return null;
    }

    return (
      <FlexRow>
        <label>Cc:</label>
        <FieldWrapper>
          {ccCollection?.length !== 0 && (
            <Recipients
              collection={ccCollection}
              onClick={index => this.removeRecipient(index, 'cc')}
            />
          )}
          <MailColumn>
            <FormControl
              autoFocus={true}
              onChange={this.onSelectChange.bind(this, 'cc')}
              name="cc"
              value={cc}
              onKeyDown={e => this.handleKeyDown(e, 'cc')}
              onFocus={() => this.setState({ focusedField: 'cc' })}
              onBlur={() => this.setState({ focusedField: '' })}
            />
            {focusedField === 'cc' && cc?.length !== 0 && (
              <MailSuggestion
                contacts={contacts}
                selectedMailIndex={selectedMailIndex}
                onClick={index => this.handleSuggestionClick(index, 'cc')}
              />
            )}
          </MailColumn>
        </FieldWrapper>
      </FlexRow>
    );
  }

  renderBCC() {
    const {
      bcc,
      bccCollection,
      hasBcc,
      selectedMailIndex,
      focusedField
    } = this.state;
    const contacts = this.getFilteredContacts('bcc');

    if (!hasBcc) {
      return null;
    }

    return (
      <FlexRow>
        <label>Bcc:</label>
        <FieldWrapper>
          {bccCollection?.length !== 0 && (
            <Recipients
              collection={bccCollection}
              onClick={index => this.removeRecipient(index, 'bcc')}
            />
          )}
          <MailColumn>
            <FormControl
              autoFocus={true}
              onChange={this.onSelectChange.bind(this, 'bcc')}
              name="bcc"
              value={bcc}
              onKeyDown={e => this.handleKeyDown(e, 'bcc')}
              onFocus={() => this.setState({ focusedField: 'bcc' })}
              onBlur={() => this.setState({ focusedField: '' })}
            />
            {focusedField === 'bcc' && bcc?.length !== 0 && (
              <MailSuggestion
                contacts={contacts}
                selectedMailIndex={selectedMailIndex}
                onClick={index => this.handleSuggestionClick(index, 'bcc')}
              />
            )}
          </MailColumn>
        </FieldWrapper>
      </FlexRow>
    );
  }

  handleKeyDown = (e, fieldName) => {
    const { selectedMailIndex } = this.state;
    const field = this.state[fieldName];
    const fieldCollection = this.state[`${fieldName}Collection`];
    const contacts = this.getFilteredContacts(fieldName);

    if (e.keyCode === 38 && selectedMailIndex > 0) {
      console.log('Arrow Up Key');

      // Arrow Up Key
      e.preventDefault();
      this.setState({
        selectedMailIndex: selectedMailIndex - 1
      });
    }

    if (e.keyCode === 40 && selectedMailIndex < contacts.length - 1) {
      console.log('Arrow Down Key');
      // Arrow Down Key
      e.preventDefault();
      this.setState({
        selectedMailIndex: selectedMailIndex + 1
      });
    }

    if (e.keyCode === 13 && field) {
      const contact = contacts[selectedMailIndex];

      !contact && this.formatInputFields(fieldName);

      contact && this.handleSuggestionClick(contact, fieldName);
    }

    if (
      e.keyCode === 8 &&
      fieldCollection.length !== 0 &&
      field?.length === 0
    ) {
      // Backspace Key
      fieldCollection.pop();
      this.setState(({
        [`${fieldName}Collection`]: [...fieldCollection]
      } as unknown) as Pick<State, keyof State>);
    }
  };

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

  renderSubmit(
    label: string,
    onClick,
    type: string,
    icon = 'message',
    kind?: string
  ) {
    const { isSubmitLoading, isSubmitResolveLoading } = this.state;
    const isResolve = kind && kind === 'resolveOrOpen';
    const isLoading = isResolve ? isSubmitResolveLoading : isSubmitLoading;

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

  signatureContent = props => {
    return <Signature {...props} />;
  };

  renderButtons() {
    const {
      isReply,
      emailTemplates,
      toggleReply,
      totalCount,
      fetchMoreEmailTemplates,
      history,
      conversationStatus,
      emailSignatures,
      brands,
      loading
    } = this.props;

    const onSubmitResolve = e => this.onSubmit(e, true);

    const onChangeAttachment = attachments => {
      for (const att of attachments) {
        att.url = readFile(att.url);
      }

      this.setState({ attachments });
    };

    const removeAttachment = (index: number) => {
      const attachments = [...this.state.attachments];

      attachments.splice(index, 1);

      this.setState({ attachments });

      onChangeAttachment(attachments);
    };

    return (
      <div>
        <UploaderWrapper>
          <Attachment
            attachment={
              (this.state.attachments || [])[0] || ({} as IAttachment)
            }
            attachments={this.state.attachments || ([] as IAttachment[])}
            removeAttachment={removeAttachment}
            withoutPreview={true}
          />
        </UploaderWrapper>
        <EditorFooter>
          <div>
            {this.renderSubmit('Send', this.onSubmit, 'primary')}
            {isReply &&
              this.renderSubmit(
                conversationStatus === 'closed'
                  ? 'Send and Open'
                  : 'Send and Resolve',
                onSubmitResolve,
                conversationStatus === 'closed' ? 'warning' : 'success',
                conversationStatus === 'closed' ? 'redo' : 'check-circle',
                'resolveOrOpen'
              )}
          </div>
          <ToolBar>
            <Uploader
              defaultFileList={this.state.attachments || []}
              onChange={onChangeAttachment}
              icon="attach"
              showOnlyIcon={true}
              noPreview={true}
            />
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
                loading={loading}
              />
            )}
            <SignatureChooser
              signatureContent={this.signatureContent}
              brands={brands || []}
              signatures={emailSignatures || []}
              emailSignature={this.state.emailSignature}
              emailContent={this.state.content}
              onContentChange={this.onContentChange}
              onSignatureChange={this.onSignatureChange}
            />
          </ToolBar>
        </EditorFooter>
      </div>
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
