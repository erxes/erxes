import dayjs from 'dayjs';
import juice from 'juice';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Avatar from 'modules/common/components/nameCard/Avatar';
import { IMessage } from 'modules/inbox/types';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import React from 'react';
import sanitizeHtml from 'sanitize-html';
import {
  SmallContent,
  Content,
  Date,
  Details,
  Meta,
  RightSide,
  Subject,
  Message,
  Reply
} from './style';

import Attachments from './Attachment';

type Props = {
  message: IMessage;
  integrationId: string;
  staff?: boolean;
  platform?: string;
  kind: string;
};

class Mail extends React.PureComponent<
  Props,
  { isReply: boolean; toggle: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      isReply: false,
      toggle: false
    };
  }

  onToggle = () => {
    this.setState({ toggle: !this.state.toggle });
  };

  onReply = () => {
    this.setState({ isReply: true });
  };

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

  renderReplyButton(details) {
    if (this.state.isReply) {
      return null;
    }

    return (
      <Button
        icon="reply"
        btnStyle="primary"
        size="small"
        onClick={this.onReply}
      >
        Reply
      </Button>
    );
  }

  renderMailForm(details) {
    const { integrationId, platform, kind } = this.props;

    if (!this.state.isReply) {
      return null;
    }

    return (
      <Message toggle={this.state.toggle}>
        <MailForm
          kind={kind}
          platform={platform}
          integrationId={integrationId}
          refetchQueries={['detailQuery']}
          conversationDetails={details}
          isReply={this.state.isReply}
        />
      </Message>
    );
  }

  renderAddress(title: string, values: any, body) {
    if (!values || values.length === 0) {
      return null;
    }

    if (this.state.toggle) {
      return <SmallContent>{body.replace(/<\/?[^>]+(>|$)/g, '')}</SmallContent>;
    }

    const emails = values.map((val, idx) => <span key={idx}>{val.email}</span>);

    return (
      <>
        {title} {emails}
      </>
    );
  }

  renderDetails(details) {
    const [{ email }] = details.from;
    const { body = '' } = details;

    return (
      <Details>
        <strong>{email}</strong>
        {this.renderAddress('To:', details.to, juice(body))}
        {this.renderAddress('Cc:', details.cc, juice(body))}
        {this.renderAddress('Bcc:', details.bcc, juice(body))}
      </Details>
    );
  }

  renderRightSide(showAttachmentIcon, createdAt) {
    return (
      <RightSide>
        {showAttachmentIcon && <Icon icon="attach" />}
        <Date>{dayjs(createdAt).format('lll')}</Date>
      </RightSide>
    );
  }

  renderBody(body, details) {
    if (this.state.toggle) {
      return null;
    }

    return (
      <>
        <Content
          dangerouslySetInnerHTML={{ __html: this.cleanHtml(body) }}
          toggle={this.state.toggle}
        />
        <Reply>{this.renderReplyButton(details)}</Reply>
      </>
    );
  }

  renderAttachments(attachments, messageId) {
    if (attachments.length === 0) {
      return;
    }

    const { kind, integrationId } = this.props;

    return (
      <Attachments
        kind={kind}
        integrationId={integrationId}
        attachments={attachments}
        messageId={messageId}
      />
    );
  }

  renderMessage = (message: IMessage) => {
    const { details, createdAt, customer } = message;

    if (!details) {
      return null;
    }

    const { messageId = '', body = '', subject = '' } = details;
    const attachments = details.attachments || [];
    const showAttachmentIcon = attachments.length > 0;

    return (
      <>
        <Subject>{subject}</Subject>
        <Message toggle={this.state.toggle}>
          <Meta toggle={this.state.toggle} onClick={this.onToggle}>
            <Avatar customer={customer} size={32} />
            {this.renderDetails(details)}
            {this.renderRightSide(showAttachmentIcon, createdAt)}
          </Meta>
          {this.renderBody(juice(body), details)}
          {this.renderAttachments(attachments, messageId)}
          <div className="clearfix" />
        </Message>
        {this.renderMailForm(details)}
      </>
    );
  };

  render() {
    const { message } = this.props;

    if (!message) {
      return null;
    }

    return this.renderMessage(message);
  }
}

export default Mail;
