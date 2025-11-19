import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

export const CLIENT_PORTAL_ADD_FORM_SCHEMA = z.object({
  name: z.string(),
});

export type TClientPortalAddForm = z.infer<
  typeof CLIENT_PORTAL_ADD_FORM_SCHEMA
>;

export const useClientPortalForm = () => {
  const methods = useForm<TClientPortalAddForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(CLIENT_PORTAL_ADD_FORM_SCHEMA),
  });

  return { methods };
};
