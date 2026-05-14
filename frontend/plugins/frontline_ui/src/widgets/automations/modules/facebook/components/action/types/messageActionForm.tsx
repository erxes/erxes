import { FieldPath } from 'react-hook-form';
import { INITIAL_OBJ_MESSAGE_TYPES } from '../constants/ReplyMessage';
import { TBotMessage } from '../states/replyMessageActionForm';

export type MessageActionTypeNames = keyof typeof INITIAL_OBJ_MESSAGE_TYPES;

export type FacebookMessageProps<U> = {
  index: number;
  message: Extract<TBotMessage, U>;
  handleMessageChange: (
    messageIndex: number,
    field: FieldPath<Extract<TBotMessage, U>>,
    newData: any,
  ) => void;
};
