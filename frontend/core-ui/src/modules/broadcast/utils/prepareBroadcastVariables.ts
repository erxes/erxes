import { BROADCAST_MESSAGE_METHOD_KINDS } from '../constants';
import { IBroadcastMethodEnum } from '../types';

type BroadcastFormData = Record<string, unknown>;

const pickEmailVariables = (email?: Record<string, unknown>) => {
  if (!email) {
    return undefined;
  }

  const { content, subject, replyTo, sender, attachments } = email;

  return {
    content,
    subject,
    replyTo,
    sender,
    attachments,
  };
};

export const prepareBroadcastVariables = (
  data: BroadcastFormData,
  method: IBroadcastMethodEnum,
  action?: 'draft' | 'live',
) => {
  const variables: Record<string, unknown> = {
    title: data.title,
    kind: BROADCAST_MESSAGE_METHOD_KINDS[method],
    method,
    targetType: data.targetType,
    targetIds: data.targetIds,
    targetCount: data.targetCount,
    isDraft: action === 'draft',
    isLive: action === 'live',
  };

  if (method === 'notification') {
    variables.cpId = data.cpId;
    variables.notification = data.notification;

    return variables;
  }

  if (method === 'messenger') {
    variables.fromUserId = data.fromUserId;
    variables.messenger = data.messenger;

    return variables;
  }

  variables.fromUserId = data.fromUserId;
  variables.email = pickEmailVariables(
    data.email as Record<string, unknown> | undefined,
  );

  return variables;
};
