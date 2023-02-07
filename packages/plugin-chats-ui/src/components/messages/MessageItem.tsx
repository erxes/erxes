import React, { useRef } from 'react';
import { convertFromHTML } from 'draft-js';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Attachment from '@erxes/ui/src/components/Attachment';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import {
  MessageItemWrapper,
  MessageWrapper,
  MessageReply,
  MessageBody,
  MessageOption,
  MessageContent,
  MessageAttachmentWrapper
} from '../../styles';

dayjs.extend(calendar);

type Props = {
  message: any;
  setReply: (text: string) => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const MessageItem = (props: FinalProps) => {
  const { message, currentUser } = props;
  const actionRef = useRef<HTMLElement>(null);

  const isMe = currentUser._id === message.createdUser._id;
  const draftContent =
    message.relatedMessage && convertFromHTML(message.relatedMessage.content);

  const handleMouseEnter = () => {
    if (actionRef && actionRef.current) {
      let element = actionRef.current;

      if (element && element.style) {
        element.style.visibility = 'visible';
      }
    }
  };

  const handleMouseLeave = () => {
    if (actionRef && actionRef.current) {
      let element = actionRef.current;

      if (element && element.style) {
        element.style.visibility = 'hidden';
      }
    }
  };

  const renderAttachments = () => {
    return (message.attachments || []).map(attachment => (
      <Attachment key={attachment._id} attachment={attachment || {}} simple />
    ));
  };

  return (
    <MessageItemWrapper
      me={isMe}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ flex: 1 }} />
      <MessageWrapper me={isMe}>
        {draftContent && (
          <MessageReply>
            <b>
              {message.relatedMessage.createdUser &&
                (message.relatedMessage.createdUser.details.fullName ||
                  message.relatedMessage.createdUser.email)}
              :&nbsp;
            </b>
            <p>{draftContent.contentBlocks[0].text}</p>
          </MessageReply>
        )}
        <MessageBody me={isMe}>
          <Tip placement="top" text="Reply">
            <MessageOption
              onClick={() => props.setReply(message)}
              innerRef={actionRef}
            >
              <Icon icon="reply" color="secondary" />
            </MessageOption>
          </Tip>
          <Tip
            placement={isMe ? 'left' : 'right'}
            text={message.createdAt && dayjs(message.createdAt).calendar()}
          >
            <MessageContent
              dangerouslySetInnerHTML={{ __html: message.content || '' }}
              me={isMe}
            />
          </Tip>
        </MessageBody>
        <MessageAttachmentWrapper>
          {renderAttachments()}
        </MessageAttachmentWrapper>
      </MessageWrapper>
      {!isMe && <Avatar user={message.createdUser} size={36} />}
    </MessageItemWrapper>
  );
};

const WithCurrentUser = withCurrentUser(MessageItem);

export default (props: Props) => {
  return <WithCurrentUser {...props} />;
};
