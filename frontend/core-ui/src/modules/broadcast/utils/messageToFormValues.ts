import { IBroadcastFormData } from '@/broadcast/hooks/useBroadcastForm';
import { TBroadcastWorkflow } from '@/broadcast/components/workflow/BroadcastWorkflowEditor';

/**
 * A saved campaign read back into the form the creation sheet uses.
 *
 * Every method's block is spread over its own empty shape: the server returns
 * these as JSON, so a field the campaign was saved without would otherwise
 * arrive as `undefined` and leave its input uncontrolled.
 */
export const messageToFormValues = (
  message: any,
  workflow?: TBroadcastWorkflow,
): Partial<IBroadcastFormData> => {
  const {
    title,
    method,
    targetType,
    targetIds,
    targetCount,
    isLive,
    isDraft,
    fromEmail,
    fromUserId,
    cpId,
    email,
    messenger,
    notification,
  } = message || {};

  const base = {
    title: title || '',
    targetType: targetType === 'tag' ? ('tag' as const) : ('segment' as const),
    targetIds: targetIds || [],
    targetCount: targetCount || 0,
    isLive: !!isLive,
    isDraft: !!isDraft,
  };

  if (method === 'workflow') {
    return {
      ...base,
      method: 'workflow',
      workflow: {
        actions: workflow?.actions || [],
        entryActionId: workflow?.entryActionId,
      },
    };
  }

  if (method === 'notification') {
    return {
      ...base,
      method: 'notification',
      cpId: cpId || '',
      notification: {
        inApp: true,
        isMobile: false,
        title: '',
        content: '',
        ...(notification || {}),
      },
    };
  }

  if (method === 'messenger') {
    return {
      ...base,
      method: 'messenger',
      fromUserId: fromUserId || '',
      messenger: {
        brandId: '',
        sentAs: 'snippet' as const,
        kind: 'chat' as const,
        content: '',
        rules: [],
        ...(messenger || {}),
      },
    };
  }

  return {
    ...base,
    method: 'email',
    fromEmail: fromEmail || '',
    email: {
      subject: '',
      sender: '',
      documentId: '',
      content: '',
      ...(email || {}),
    },
  };
};
