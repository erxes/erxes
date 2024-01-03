import React, { useRef } from 'react';
import { convertFromHTML } from 'draft-js';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
// erxes
import Avatar from '../../../common/nameCard/Avatar';
import Attachment from '../../../common/Attachment';
import Tip from '../../../common/Tip';
import Icon from '../../../common/Icon';
import { IUser } from '../../../auth/types';
import {
  MessageItemWrapper,
  MessageWrapper,
  MessageReply,
  MessageBody,
  MessageOption,
  MessageContent,
  MessageAttachmentWrapper,
  MessageBy
} from '../../styles';
import ChatForward from '../../containers/chat/ChatForward';

dayjs.extend(calendar);

type Props = {
  message: any;
  setReply: (text: string) => void;
  currentUser: IUser;
  chatType?: string;
};

const MessageItem = (props: Props) => {
  const { message, currentUser, chatType } = props;
  const actionRef = useRef<HTMLElement>(null);

  const isMe = currentUser._id === message.createdUser._id;
  const draftContent =
    message.relatedMessage && convertFromHTML(message.relatedMessage.content);

  const handleMouseEnter = () => {
    if (actionRef && actionRef.current) {
      const element = actionRef.current;

      if (element && element.style) {
        element.style.visibility = 'visible';
      }
    }
  };

  const handleMouseLeave = () => {
    if (actionRef && actionRef.current) {
      const element = actionRef.current;

      if (element && element.style) {
        element.style.visibility = 'hidden';
      }
    }
  };

  const renderAttachments = () => {
    return (message.attachments || []).map((attachment) => (
      <Attachment
        key={attachment._id}
        attachment={attachment || {}}
        simple={true}
        size={200}
      />
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
        {chatType === 'group' && !isMe && (
          <MessageBy>
            {message.createdUser &&
              (message.createdUser.details.fullName ||
                message.createdUser.email)}
          </MessageBy>
        )}
        <MessageBody me={isMe} id="MessageBody">
          <Tip placement="top" text="Reply">
            <MessageOption
              onClick={() => props.setReply(message)}
              innerRef={actionRef}
            >
              <Icon icon="reply" color="#9d9d9d" />
            </MessageOption>
          </Tip>
          <ChatForward
            content={message.content}
            attachments={message.attachments}
            currentUser={currentUser}
          />
          <Tip
            placement="top"
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
      {!isMe && <Avatar user={message.createdUser} size={28} />}
    </MessageItemWrapper>
  );
};

export default MessageItem;
