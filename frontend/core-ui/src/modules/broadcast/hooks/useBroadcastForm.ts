import { useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { broadcastSchema } from '../schema';
import { IBroadcastMethodEnum } from '../types';

export type IBroadcastFormData = z.infer<typeof broadcastSchema>;

const getDefaultValues = (
  method?: IBroadcastMethodEnum,
  broadcastContactId?: string | null,
): Partial<IBroadcastFormData> => {
  const base = broadcastContactId
    ? {
        targetType: 'customer' as const,
        targetIds: [broadcastContactId],
        targetCount: 1,
        isLive: false,
        isDraft: false,
        title: '',
      }
    : {
        targetType: 'segment' as const,
        targetIds: [],
        targetCount: 0,
        isLive: false,
        isDraft: false,
        title: '',
      };

  if (method === 'notification') {
    return {
      ...base,
      method: 'notification',
      cpId: '',
      notification: {
        inApp: true,
        isMobile: false,
        title: '',
        content: '',
      },
    };
  }

  if (method === 'messenger') {
    return {
      ...base,
      method: 'messenger',
      fromUserId: '',
      messenger: {
        brandId: '',
        sentAs: 'snippet',
        kind: 'chat',
        content: '',
        rules: [],
      },
    };
  }

  return {
    ...base,
    method: method ?? 'email',
    fromEmail: '',
    email: {
      subject: '',
      sender: '',
      documentId: '',
      previewText: '',
    },
  };
};

const useBroadcastForm = () => {
  const [method] = useQueryState<IBroadcastMethodEnum>('method');
  const [broadcastContactId] = useQueryState<string>('broadcastContactId');

  const form = useForm<IBroadcastFormData>({
    defaultValues: getDefaultValues(method ?? undefined, broadcastContactId),
  });

  useEffect(() => {
    form.reset(getDefaultValues(method ?? undefined, broadcastContactId));
  }, [form, method, broadcastContactId]);

  return { form };
};

export { useBroadcastForm };
