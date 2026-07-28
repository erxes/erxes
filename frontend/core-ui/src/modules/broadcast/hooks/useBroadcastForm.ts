import { useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { broadcastSchema } from '../schema';
import { IBroadcastMethodEnum } from '../types';

export type IBroadcastFormData = z.infer<typeof broadcastSchema>;

const getDefaultValues = (
  method?: IBroadcastMethodEnum,
): Partial<IBroadcastFormData> => {
  const base = {
    targetType: 'tag' as const,
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
    fromUserId: '',
    email: {
      subject: '',
      sender: '',
      documentId: '',
      content: '',
    },
  };
};

const useBroadcastForm = () => {
  const [method] = useQueryState<IBroadcastMethodEnum>('method');

  const form = useForm<IBroadcastFormData>({
    defaultValues: getDefaultValues(method ?? undefined),
  });

  useEffect(() => {
    form.reset(getDefaultValues(method ?? undefined));
  }, [form, method]);

  return { form };
};

export { useBroadcastForm };
