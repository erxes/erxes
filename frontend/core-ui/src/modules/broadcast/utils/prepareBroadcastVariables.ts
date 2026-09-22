import { BROADCAST_MESSAGE_METHOD_KINDS } from '../constants';
import { IBroadcastMethodEnum } from '../types';

type BroadcastFormData = Record<string, unknown>;

const pickEmailVariables = (email?: Record<string, unknown>) => {
  if (!email) {
    return undefined;
  }

  const {
    content,
    contentJson,
    contentFormat,
    subject,
    replyTo,
    sender,
    previewText,
    attachments,
  } = email;

  return {
    content,
    contentJson,
    // Said outright rather than inferred later from which field is filled.
    contentFormat: contentFormat || (contentJson ? 'maily' : 'blocks'),
    subject,
    replyTo,
    sender,
    previewText,
    attachments,
  };
};

export type TBroadcastAction = 'draft' | 'live' | 'schedule';

export const prepareBroadcastVariables = (
  data: BroadcastFormData,
  method: IBroadcastMethodEnum,
  action?: TBroadcastAction,
) => {
  const variables: Record<string, unknown> = {
    title: data.title,
    kind: BROADCAST_MESSAGE_METHOD_KINDS[method],
    method,
    targetType: data.targetType,
    targetIds: data.targetIds,
    targetCount: data.targetCount,
    // Scheduling saves a draft first: a campaign has to exist before a moment
    // can be set on it, and a failed schedule then leaves the work intact.
    isDraft: action === 'draft' || action === 'schedule',
    isLive: action === 'live',
  };

  if (method === 'workflow') {
    variables.workflow = data.workflow;

    return variables;
  }

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

  variables.fromEmail = data.fromEmail;
  variables.email = pickEmailVariables(
    data.email as Record<string, unknown> | undefined,
  );

  return variables;
};
