import {
  TBotMessage,
  TMessageActionForm,
} from '../states/replyMessageActionForm';
import { INITIAL_OBJ_MESSAGE_TYPES } from '../constants/ReplyMessage';
import { Control, FieldPath } from 'react-hook-form';

export type MessageActionTypeNames = keyof typeof INITIAL_OBJ_MESSAGE_TYPES;

export type FacebookMessageProps = {
  index: number;
  message: TBotMessage;
  handleMessageChange: (
    messageIndex: number,
    field: FieldPath<TBotMessage>,
    newData: any,
  ) => void;
};
