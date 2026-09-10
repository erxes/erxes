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
  const isSkipped = result?.status === 'skipped';
  // `result` is written when the reply is handed to the queue and never
  // updated, so the action's own status is what says how the wait ended.
  const isDropped = action?.status === 'dropped';
  const isQueued = result?.status === 'queued' && !isDropped;
  const messages = unwrapSentMessages(result).map(toSentMessage);

  return {
    error,
    hasError: Boolean(error),
    isCommentReply,
    isDropped,
    isQueued,
    sendAfterMs: result?.sendAfterMs as number | undefined,
    isSkipped,
    skipReason: result?.reason as string | undefined,
    blockedUntil: result?.blockedUntil as string | undefined,
    messages,
    // The run records the variant it posted; older runs only kept the config.
    commentText: result?.text || action?.actionConfig?.text,
    commentAttachments: (action?.actionConfig?.attachments || []) as {
      url?: string;
    }[],
    isWaiting: Boolean(result?.waitCondition),
  };
};
