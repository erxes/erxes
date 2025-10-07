import { useForm } from 'react-hook-form';
import { TChannelForm } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CHANNEL_SCHEMA } from '../schema/channel';

export const useChannelsForm = ({
  defaultValues,
}: {
  defaultValues?: TChannelForm;
}) => {
  const form = useForm<TChannelForm>({
    mode: 'onBlur',
    defaultValues: defaultValues || {
      name: '',
      description: '',
      memberIds: [],
    },
    resolver: zodResolver(CHANNEL_SCHEMA),
  });

  return form;
};
