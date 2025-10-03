import { z } from 'zod';
import { TAGS_FORM_SCHEMA } from '../schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export type TTagsForm = z.infer<typeof TAGS_FORM_SCHEMA>;

export const useTagsForm = () => {
  const methods = useForm<TTagsForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      type: '',
    },
    resolver: zodResolver(TAGS_FORM_SCHEMA),
  });
  return {
    methods,
  };
};
