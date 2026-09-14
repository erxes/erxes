import { useQueryState } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { broadcastSchema } from '../schema';
import { IBroadcastMethodEnum } from '../types';

export type IBroadcastFormData = z.infer<typeof broadcastSchema>;

const getDefaultValues = (
  method?: IBroadcastMethodEnum,
): Partial<IBroadcastFormData> => {
  const base = {
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

  if (method === 'workflow') {
    return {
      ...base,
      method: 'workflow',
      workflow: { actions: [], entryActionId: undefined },
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
      content: '',
    },
  };
};

/**
 * @param initialValues a saved campaign read back for editing. Its own method
 * wins over the one in the query string, so an edit sheet cannot be opened
 * into the wrong shape.
 */
const useBroadcastForm = (initialValues?: Partial<IBroadcastFormData>) => {
  const [queryMethod] = useQueryState<IBroadcastMethodEnum>('method');
  const method = (initialValues?.method ?? queryMethod ?? undefined) as
    | IBroadcastMethodEnum
    | undefined;

  const defaultValues = useMemo<Partial<IBroadcastFormData>>(
    () => ({ ...getDefaultValues(method), ...initialValues }),
    [method, initialValues],
  );

  const form = useForm<IBroadcastFormData>({ defaultValues });

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  return { form };
};

export { useBroadcastForm };
