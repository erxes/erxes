import dayjs from 'dayjs';
import juice from 'juice';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Avatar from 'modules/common/components/nameCard/Avatar';
import { IGmailData, IMessage } from 'modules/inbox/types';
import MailForm from 'modules/settings/integrations/containers/google/MailForm';
import React from 'react';
import sanitizeHtml from 'sanitize-html';
import {
  Content,
  Date,
  Details,
  EmailItem,
  Meta,
  RightSide,
  Subject
} from './style';

import { extractEmail } from 'modules/inbox/utils';
import Attachments from './Attachment';

type Props = {
  message: IMessage;
  integrationId: string;
  staff?: boolean;
};

class Mail extends React.PureComponent<Props, {}> {
  cleanHtml(mailContent: string) {
    return sanitizeHtml(mailContent, {
      allowedTags: false,
      allowedAttributes: false,
      transformTags: {
        html: 'div',
        body: 'div'
      },

      // remove some unusual tags
      exclusiveFilter: n => {
        return n.tag === 'meta' || n.tag === 'head' || n.tag === 'style';
      }
    });
  }

  renderMailForm(gmailData: IGmailData) {
    const { integrationId } = this.props;

    if (!gmailData) {
      return null;
    }

    const { subject, references, headerId, threadId } = gmailData;

    const cc = extractEmail(gmailData.cc);
    const bcc = extractEmail(gmailData.bcc);
    const to = extractEmail(gmailData.to);

    const content = props => (
      <MailForm
        to={to}
        fromEmail={gmailData.from}
        integrationEmail={gmailData.integrationEmail}
        cc={cc}
        bcc={bcc}
        references={references}
        integrationId={integrationId}
        refetchQueries={['detailQuery']}
        headerId={headerId}
        threadId={threadId}
        closeModal={props.closeModal}
        subject={subject}
      />
    );

    const trigger = (
      <Button icon="reply" btnStyle="simple" size="small">
        Reply
      </Button>
    );

    return (
      <ModalTrigger
        title={`Replying: ${subject}`}
        trigger={trigger}
        size="lg"
        content={content}
      />
    );
  }

  renderAddress(title: string, value: string | undefined) {
    if (!value) {
      return null;
    }

    return (
      <>
        {title} <span>{value}</span>
      </>
    );
  }

  renderGmailMessage = (message: IMessage) => {
    const { integrationId } = this.props;
    const email = message.gmailData;

    if (!email) {
      return null;
    }

    const attachments = email.attachments || [];
    const mailContent = juice(email.textHtml || email.textPlain || '');

    return (
      <EmailItem key={email.messageId}>
        <Subject>{email.subject}</Subject>
        <Meta>
          <Avatar customer={message.customer} size={32} />
          <Details>
            <strong>{email.from}</strong>
            {this.renderAddress('To:', email.to)}
            {this.renderAddress('Cc:', email.cc)}
            {this.renderAddress('Bc:', email.bcc)}
          </Details>
          <RightSide>
            {attachments.length > 0 && <Icon icon="attach" />}
            <Date>{dayjs(message.createdAt).format('lll')}</Date>
            {this.renderMailForm(email)}
          </RightSide>
        </Meta>
        <Content
          dangerouslySetInnerHTML={{ __html: this.cleanHtml(mailContent) }}
        />
        <Attachments
          integrationId={integrationId}
          attachments={attachments}
          messageId={email.messageId || ''}
        />
        <div className="clearfix" />
      </EmailItem>
    );
  };

  render() {
    const { message } = this.props;

    if (!message) {
      return null;
    }

    return this.renderGmailMessage(message);
  }
}

export default Mail;
