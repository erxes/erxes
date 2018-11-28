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

type Props = {
  message: IMessage;
  staff?: boolean;
};

class Mail extends React.Component<Props, {}> {
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
    const { message } = this.props;
    const customerId = message.customer && message.customer._id;
    const subject = gmailData.subject;

    const content = props => (
      <MailForm
        contentType="customer"
        contentTypeId={customerId || ''}
        toEmail={gmailData.from}
        refetchQueries={['detailQuery']}
        headerId={gmailData.headerId}
        threadId={gmailData.threadId}
        closeModal={props.closeModal}
        subject={`Re: ${subject}`}
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
    const gmailData = message.gmailData;
    const attachments = message.gmailDataAttachments || [];

    if (!gmailData) {
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
      </EmailItem>
    );
  }
}

export default Mail;
