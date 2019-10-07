import dayjs from 'dayjs';
import juice from 'juice';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Avatar from 'modules/common/components/nameCard/Avatar';
import { IMail, IMessage } from 'modules/inbox/types';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import React from 'react';
import sanitizeHtml from 'sanitize-html';
import Attachments from './Attachment';
import {
  Content,
  Date,
  Details,
  Message,
  Meta,
  Reply,
  RightSide,
  SmallContent
} from './style';

type Props = {
  message: IMessage;
  integrationId: string;
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

  toggleReply = () => {
    this.setState({ isReply: !this.state.isReply });
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
        onClick={this.toggleReply}
      >
        Reply
      </Button>
    );
  }

  renderMailForm(details) {
    const { isReply } = this.state;
    const { integrationId, kind } = this.props;

    if (!isReply) {
      return null;
    }

    return (
      <Message>
        <MailForm
          kind={kind}
          toggleReply={this.toggleReply}
          integrationId={integrationId}
          refetchQueries={['detailQuery']}
          conversationDetails={details}
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

  renderRightSide(showIcon, createdAt) {
    return (
      <RightSide>
        {showIcon && <Icon icon="attach" />}
        <Date>{dayjs(createdAt).format('lll')}</Date>
      </RightSide>
    );
  }

  renderBody(details) {
    const { toggle } = this.state;

    if (toggle) {
      return null;
    }

    const innerHTML = { __html: this.cleanHtml(details.body || '') };

    return (
      <>
        <Content toggle={toggle} dangerouslySetInnerHTML={innerHTML} />
        <Reply>{this.renderReplyButton(details)}</Reply>
      </>
    );
  }

  renderAttachments(details) {
    const { messageId, attachments = [] } = details;

    if (!attachments || attachments.length === 0) {
      return;
    }

    const { kind, integrationId } = this.props;

    return (
      <Attachments
        kind={kind.includes('nylas') ? 'nylas' : kind}
        integrationId={integrationId}
        attachments={attachments}
        messageId={messageId}
      />
    );
  }

  renderMeta = (message: IMessage) => {
    const { customer, createdAt, details = {} as IMail } = message;

    const showIcon = (details.attachments || []).length > 0;

    return (
      <Meta toggle={this.state.toggle} onClick={this.onToggle}>
        <Avatar customer={customer} size={32} />
        {this.renderDetails(details)}
        {this.renderRightSide(showIcon, createdAt)}
      </Meta>
    );
  };

  renderMessage = (message: IMessage) => {
    const { details } = message;

    return (
      <Message toggle={this.state.toggle}>
        {this.renderMeta(message)}
        {this.renderBody(details)}
        {this.renderAttachments(details)}
        <div className="clearfix" />
      </Message>
    );
  };

  render() {
    const { message = {} as IMessage } = this.props;
    const details = message.details || {};

    if (!message || !details) {
      return null;
    }

    return (
      <>
        {this.renderMessage(message)}
        {this.renderMailForm(details)}
      </>
    );
  }
}

export default Mail;
