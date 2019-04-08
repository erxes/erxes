import * as juice from 'juice';
import { Button, Icon, ModalTrigger } from 'modules/common/components';
import Avatar from 'modules/common/components/nameCard/Avatar';
import { IConversationGmailData, IMessage } from 'modules/inbox/types';
import { MailForm } from 'modules/settings/integrations/containers/google';
import * as moment from 'moment';
import * as React from 'react';
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

  renderMailForm(gmailData: IConversationGmailData) {
    const { message, integrationId } = this.props;
    const customerId = message.customer && message.customer._id;
    const subject = gmailData.subject;

    const content = props => (
      <MailForm
        contentType="customer"
        contentTypeId={customerId || ''}
        toEmail={gmailData.from}
        integrationId={integrationId}
        refetchQueries={['detailQuery']}
        headerId={gmailData.headerId}
        threadId={gmailData.threadId}
        closeModal={props.closeModal}
        subject={subject}
      />
    );

    return (
      <ModalTrigger
        title={`Replying: ${subject}`}
        trigger={
          <Button icon="reply" btnStyle="simple" size="small">
            Reply
          </Button>
        }
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

  render() {
    const { message } = this.props;

    // gmail data
    const gmailData = message.gmailData || {};
    const attachments = gmailData.attachments || [];

    if (gmailData === {}) {
      return null;
    }

    // all style inlined
    const mailContent = juice(gmailData.textHtml || gmailData.textPlain || '');

    return (
      <EmailItem>
        <Subject>{gmailData.subject}</Subject>
        <Meta>
          <Avatar customer={message.customer} size={32} />
          <Details>
            <strong>{gmailData.from}</strong>
            {this.renderAddress('To:', gmailData.to)}
            {this.renderAddress('Cc:', gmailData.cc)}
            {this.renderAddress('Bc:', gmailData.bcc)}
          </Details>
          <RightSide>
            {attachments.length > 0 && <Icon icon="attach" />}
            <Date>{moment(message.createdAt).format('lll')}</Date>
            {this.renderMailForm(gmailData)}
          </RightSide>
        </Meta>
        <Content
          dangerouslySetInnerHTML={{ __html: this.cleanHtml(mailContent) }}
        />
        <Attachments attachments={attachments} messageId={message._id || ''} />
        <div className="clearfix" />
      </EmailItem>
    );
  }
}

export default Mail;
