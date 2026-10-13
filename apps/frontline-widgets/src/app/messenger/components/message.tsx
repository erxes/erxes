import {
  MessageRoot,
  MessageRow,
  MessageBody,
  MessageAvatar,
  MessageAuthor,
} from './message/core';
import { MessageContent } from './message/content';
import { MessageAttachments } from './message/attachments';
import {
  MessageTime,
  MessageTooltip,
  MessageTimestampTooltip,
  MessageActions,
  MessageAction,
  MessageItemActions,
} from './message/meta';

export const Message = Object.assign(MessageRoot, {
  Row: MessageRow,
  Body: MessageBody,
  Avatar: MessageAvatar,
  Author: MessageAuthor,
  Content: MessageContent,
  Attachments: MessageAttachments,
  Time: MessageTime,
  Tooltip: MessageTooltip,
  TimestampTooltip: MessageTimestampTooltip,
  Actions: MessageActions,
  Action: MessageAction,
  ItemActions: MessageItemActions,
});
