import { useForm } from 'react-hook-form';
import { TMessageProConfig } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { MESSAGE_PRO_CONFIG_SCHEMA } from '../schema/config';

export const useConfigForm = () => {
  const form = useForm<TMessageProConfig>({
    defaultValues: {
      MESSAGE_PRO_API_KEY: '',
      MESSAGE_PRO_PHONE_NUMBER: '',
    },
    resolver: zodResolver(MESSAGE_PRO_CONFIG_SCHEMA),
  });

  return {
    form,
  };
};
