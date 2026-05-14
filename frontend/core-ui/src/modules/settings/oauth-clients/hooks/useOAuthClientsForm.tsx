import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { OAUTH_CLIENTS_FORM_SCHEMA } from '../schema';

export type TOAuthClientsForm = z.infer<typeof OAUTH_CLIENTS_FORM_SCHEMA>;

export const useOAuthClientsForm = (
  defaultValues?: Partial<TOAuthClientsForm>,
) => {
  const methods = useForm<TOAuthClientsForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      type: 'public',
      redirectUrls: [],
      ...defaultValues,
    },
    resolver: zodResolver(OAUTH_CLIENTS_FORM_SCHEMA),
  });

  return { methods };
};
