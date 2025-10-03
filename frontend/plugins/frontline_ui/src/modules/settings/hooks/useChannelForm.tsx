import { useForm } from 'react-hook-form';
import { type TChannelForm } from '../types/channel';
import { zodResolver } from '@hookform/resolvers/zod';
import { CHANNEL_FORM_SCHEMA } from '../schema/channel';

export function useChannelForm() {
  const methods = useForm<TChannelForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      description: '',
    },
    resolver: zodResolver(CHANNEL_FORM_SCHEMA),
  });

  return { methods };
}
