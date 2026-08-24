import { IAutomationHistoryAction } from 'ui-modules';
import {
  TFacebookSentMessage,
  TFacebookSentPart,
} from '~/widgets/automations/modules/facebook/components/history/types';

// The message action returns the sent conversation messages, and wraps them in
// `{ result, waitCondition }` once the action has optional connections
const unwrapSentMessages = (result: any): any[] => {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.result)) {
    return result.result;
  }

  return [];
};

const toSentMessage = (message: any, index: number): TFacebookSentMessage => ({
  key: message?.mid || message?._id || `message-${index}`,
  order: index + 1,
  mid: message?.mid,
  createdAt: message?.createdAt,
  parts: (message?.botData || []) as TFacebookSentPart[],
  content: message?.content,
});

export const useFacebookAutomationHistoryResult = (
  action: IAutomationHistoryAction,
  result: any,
) => {
  const error = result?.error;
  const isCommentReply = action?.actionType?.endsWith('comments');
  const messages = unwrapSentMessages(result).map(toSentMessage);

  return {
    error,
    hasError: Boolean(error),
    isCommentReply,
    messages,
    // Comment replies record only a status, so the text that went out is read
    // back from the config the run used
    commentText: action?.actionConfig?.text,
    commentAttachments: (action?.actionConfig?.attachments || []) as {
      url?: string;
    }[],
    isWaiting: Boolean(result?.waitCondition),
  };
};
