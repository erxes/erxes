import classNames from 'classnames';
import dayjs from 'dayjs';
import Attachment from 'modules/common/components/Attachment';
import NameCard from 'modules/common/components/nameCard/NameCard';
import TextDivider from 'modules/common/components/TextDivider';
import Tip from 'modules/common/components/Tip';
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
    const { attachments } = message;

    if (!hasAttachment) {
      return null;
    }

    return attachments.map((attachment, index) => (
      <Attachment key={index} attachment={attachment} />
    ));
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
          <Tip text={dayjs(messageDate).format('lll')}>
            <footer>{dayjs(messageDate).format('LT')}</footer>
          </Tip>
        </MessageBody>
      </MessageItem>
    );
  }
}
