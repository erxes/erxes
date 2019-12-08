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
import { IIntegration } from 'modules/settings/integrations/types';
import React, { ReactNode } from 'react';
import { MAIL_TOOLBARS_CONFIG } from '../../constants';
import { formatObj, formatStr } from '../../containers/utils';
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
  toAll?: boolean;
  closeModal?: () => void;
  toggleReply?: () => void;
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
};

class MailForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const mailData = props.mailData || ({} as IMail);

    const cc = formatObj(mailData.cc || []);
    const bcc = formatObj(mailData.bcc || []);
    const [from] = mailData.from || [{}];
    const sender = this.getEmailSender(from.email || props.fromEmail);

    const fromId = this.getIntegrationId(
      props.integrations,
      props.integrationId
    );

    this.state = {
      cc,
      bcc,
      to: sender,

      hasCc: cc ? cc.length > 0 : false,
      hasBcc: bcc ? bcc.length > 0 : false,
      hasSubject: !props.isReply,

      isLoading: false,

      fromEmail: sender,
      from: fromId,
      subject: mailData.subject || '',
      content: '',

      status: 'draft',
      isUploading: false,
      kind: this.getSelectedIntegrationKind(fromId),

      attachments: [],
      fileIds: [],
      totalFileSize: 0,

      integrations: props.integrations
    };
  }

  onSubmit = () => {
    const {
      isReply,
      toAll,
      closeModal,
      toggleReply,
      integrationId,
      sendMail
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
    const { references, headerId, threadId, messageId } = mailData;

    this.setState({ isLoading: true });

    const variables = {
      headerId,
      references,
      threadId,
      replyToMessageId: messageId,
      to: formatStr(to),
      cc: toAll ? formatStr(cc) : [],
      bcc: toAll ? formatStr(bcc) : [],
      from: integrationId ? integrationId : from,
      subject: subject || mailData.subject,
      attachments,
      kind,
      body: content,
      erxesApiId: from
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

  getSelectedIntegrationKind = (selectedId: string) => {
    const integration = this.props.integrations.find(
      obj => obj._id === selectedId
    );
    return (integration && integration.kind) || '';
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
      this.setState({ from, kind: this.getSelectedIntegrationKind(from) });
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
    return (
      <Tip text={__(text)} placement="top">
        <Label>
          <Icon icon={icon} onClick={onClick} />
          {element}
        </Label>
      </Tip>
    );
  };

  renderButtons() {
    const { isLoading, kind } = this.state;
    const { toggleReply } = this.props;

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
            <Button
              onClick={this.onSubmit}
              btnStyle="success"
              size="small"
              icon={isLoading ? undefined : 'message'}
              disabled={isLoading}
            >
              {isLoading && <SmallLoader />}
              Send
            </Button>
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

  renderLeftSide() {
    const { toAll } = this.props;

    return (
      <Column>
        {this.renderFrom()}
        {this.renderTo()}
        {toAll && this.renderCC()}
        {toAll && this.renderBCC()}
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
