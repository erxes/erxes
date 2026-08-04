import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { APPS_FORM_SCHEMA } from '../schema';
import { z } from 'zod';

export type TAppsForm = z.infer<typeof APPS_FORM_SCHEMA>;

export const useAppsForm = (defaultValues?: Partial<TAppsForm>) => {
  const methods = useForm<TAppsForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      ...defaultValues,
    },
    resolver: zodResolver(APPS_FORM_SCHEMA),
  });
  return {
    methods,
  };
};
