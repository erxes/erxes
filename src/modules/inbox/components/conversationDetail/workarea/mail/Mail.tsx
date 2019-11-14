import dayjs from 'dayjs';
import juice from 'juice';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Avatar from 'modules/common/components/nameCard/Avatar';
import { IMail, IMessage } from 'modules/inbox/types';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import React from 'react';
import sanitizeHtml from 'sanitize-html';
import Attachments from './Attachments';
import {
  BoxItem,
  Content,
  Date,
  Details,
  Meta,
  Reply,
  RightSide
} from './style';

type Props = {
  message: IMessage;
  integrationId: string;
  kind: string;
  isLast: boolean;
};

class Mail extends React.PureComponent<
  Props,
  { isReply: boolean; isCollapsed: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      isReply: false,
      isCollapsed: !props.isLast
    };
  }

  onToggleContent = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
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

  renderReplyButton() {
    if (this.state.isReply) {
      return null;
    }

    return (
      <Reply>
        <Button icon="reply" size="small" onClick={this.toggleReply}>
          Reply
        </Button>
      </Reply>
    );
  }

  renderMailForm(mailData) {
    const { isReply } = this.state;
    const { integrationId, kind } = this.props;

    if (!isReply) {
      return null;
    }

    return (
      <BoxItem>
        <MailForm
          kind={kind}
          isReply={isReply}
          toggleReply={this.toggleReply}
          integrationId={integrationId}
          refetchQueries={['detailQuery']}
          mailData={mailData}
        />
      </BoxItem>
    );
  }

  renderAddress(title: string, values: any) {
    if (!values || values.length === 0) {
      return null;
    }

    const emails = values.map((val, idx) => <span key={idx}>{val.email}</span>);

    return (
      <>
        {title} {emails}
      </>
    );
  }

  renderDetails(mailData) {
    const [from] = mailData.from || [{}];

    return (
      <Details>
        <strong>{from.email || ''}</strong>
        {this.renderAddress('To:', mailData.to)}
        {this.renderAddress('Cc:', mailData.cc)}
        {this.renderAddress('Bcc:', mailData.bcc)}
      </Details>
    );
  }

  renderRightSide(hasAttachments: boolean, createdAt: Date) {
    return (
      <RightSide>
        {hasAttachments && <Icon icon="paperclip" />}
        <Date>{dayjs(createdAt).format('lll')}</Date>
      </RightSide>
    );
  }

  renderBody(mailData) {
    const { isCollapsed } = this.state;

    if (isCollapsed) {
      return null;
    }

    // all style inlined
    const mailContent = juice(mailData.body || '');

    const innerHTML = { __html: this.cleanHtml(mailContent) };

    return (
      <>
        <Content dangerouslySetInnerHTML={innerHTML} />
        {this.renderReplyButton()}
        {this.renderAttachments(mailData)}
      </>
    );
  }

  renderAttachments(mailData) {
    const { messageId, attachments = [] } = mailData;

    if (!attachments || attachments.length === 0) {
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

  renderMeta = (message: IMessage) => {
    const { customer, createdAt, mailData = {} as IMail } = message;
    const hasAttachments = mailData
      ? (mailData.attachments || []).length > 0
      : false;

    return (
      <Meta toggle={this.state.isCollapsed} onClick={this.onToggleContent}>
        <Avatar customer={customer} size={32} />
        {this.renderDetails(mailData)}
        {this.renderRightSide(hasAttachments, createdAt)}
      </Meta>
    );
  };

  renderMessage = (message: IMessage) => {
    const { mailData } = message;

    return (
      <BoxItem toggle={this.state.isCollapsed}>
        {this.renderMeta(message)}
        {this.renderBody(mailData)}
      </BoxItem>
    );
  };

  render() {
    const { message = {} as IMessage } = this.props;

    if (!message) {
      return null;
    }

    console.log(message);

    const { mailData } = message;

    if (!mailData) {
      return null;
    }

    return (
      <>
        {this.renderMessage(message)}
        {this.renderMailForm(mailData)}
      </>
    );
  }
}

export default Mail;
