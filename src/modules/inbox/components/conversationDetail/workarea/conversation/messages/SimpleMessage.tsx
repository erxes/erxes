import classNames from 'classnames';
import {
  Attachment,
  NameCard,
  TextDivider,
  Tip
} from 'modules/common/components';
import moment from 'moment';
import React from 'react';
import xss from 'xss';
import { IMessage } from '../../../../../types';
import { MessageBody, MessageContent, MessageItem } from '../styles';

type Props = {
  message: IMessage;
  classes?: string[];
  isStaff: boolean;
  isSameUser?: boolean;
  renderContent?: () => React.ReactNode;
};

export default class SimpleMessage extends React.Component<Props, {}> {
  renderAvatar() {
    const { message, isSameUser } = this.props;

    if (isSameUser) {
      return null;
    }

    const user = message.user;
    const customer = message.customer;
    const props = user ? { user } : { customer };

    return <NameCard.Avatar {...props} />;
  }

  renderAttachment(hasAttachment: boolean) {
    const { message } = this.props;

    if (!hasAttachment) {
      return null;
    }

    return <Attachment attachment={message.attachments[0]} />;
  }

  renderContent(hasAttachment: boolean) {
    const { message, renderContent } = this.props;

    if (renderContent) {
      return renderContent();
    }

    return (
      <>
        <span dangerouslySetInnerHTML={{ __html: xss(message.content) }} />
        {this.renderAttachment(hasAttachment)}
      </>
    );
  }

  render() {
    const { message, isStaff, isSameUser } = this.props;
    const messageDate = message.createdAt;
    const hasAttachment = message.attachments && message.attachments.length > 0;

    const classes = classNames({
      ...(this.props.classes || []),
      attachment: hasAttachment,
      same: isSameUser
    });

    if (message.fromBot) {
      return <TextDivider text={message.content} date={messageDate} />;
    }

    return (
      <MessageItem staff={isStaff} className={classes} isSame={isSameUser}>
        {this.renderAvatar()}

        <MessageBody staff={isStaff}>
          <MessageContent staff={isStaff} internal={message.internal}>
            {this.renderContent(hasAttachment)}
          </MessageContent>
          <Tip text={moment(messageDate).format('lll')}>
            <footer>{moment(messageDate).format('LT')}</footer>
          </Tip>
        </MessageBody>
      </MessageItem>
    );
  }
}
