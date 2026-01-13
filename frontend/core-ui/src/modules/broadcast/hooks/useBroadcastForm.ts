import { useQueryState } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { broadcastSchema } from '../schema';
import { IBroadcastMethodEnum } from '../types';

export type IBroadcastFormData = z.infer<typeof broadcastSchema>;

const useBroadcastForm = () => {
  const [method] = useQueryState<IBroadcastMethodEnum>('method');

  const form = useForm<IBroadcastFormData>({
    defaultValues: {
      method: method ?? undefined,
      targetType: 'tag',
      targetIds: [],
      isLive: false,
      isDraft: false
    },
  });

  return { form };
};

export { useBroadcastForm };
