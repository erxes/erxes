import {
  CallBox,
  MessageBody,
  MessageContent,
  MessageItem,
  UserInfo
} from '../styles';

import Attachment from '@erxes/ui/src/components/Attachment';
import { IMessage } from '../../../../../types';
import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import React from 'react';
import TextDivider from '@erxes/ui/src/components/TextDivider';
import Tip from '@erxes/ui/src/components/Tip';
import VideoCallMessage from './VideoCallMessage';
import { __ } from '@erxes/ui/src/utils';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { urlify } from '@erxes/ui/src/utils/urlParser';
import xss from 'xss';

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

    return attachments.map((attachment, index) => {
      return <Attachment key={index} attachment={attachment} simple={true} />;
    });
  }

  renderVideoCallRequest() {
    return (
      <CallBox>
        <UserInfo>
          <strong>
            <Icon icon="exclamation-triangle" color="#EA475D" size={15} />{' '}
            {__('You have received a video call request')}
          </strong>
        </UserInfo>
      </CallBox>
    );
  }

  renderContent(hasAttachment: boolean) {
    const { message, renderContent, isStaff } = this.props;

    if (renderContent) {
      return renderContent();
    }

    if (message.contentType === 'videoCall') {
      return <VideoCallMessage message={message} />;
    }

    if (message.contentType === 'videoCallRequest') {
      return this.renderVideoCallRequest();
    }

    if (!message.content) {
      return (
        <MessageContent staff={isStaff} internal={message.internal}>
          {this.renderAttachment(hasAttachment)}{' '}
        </MessageContent>
      );
    }

    return (
      <>
        <MessageContent staff={isStaff} internal={message.internal}>
          <span
            dangerouslySetInnerHTML={{ __html: xss(urlify(message.content)) }}
          />
          {this.renderAttachment(hasAttachment)}
        </MessageContent>
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
          {this.renderContent(hasAttachment)}
          <Tip text={dayjs(messageDate).format('lll')}>
            <footer>{dayjs(messageDate).format('LT')}</footer>
          </Tip>
        </MessageBody>
      </MessageItem>
    );
  }
}
