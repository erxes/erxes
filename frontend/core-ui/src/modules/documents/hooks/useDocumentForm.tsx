import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryState } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const documentValidationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  contentType: z.string().min(1, 'Content type is required'),
});

export type FormType = z.infer<typeof documentValidationSchema>;

const useDocumentForm = () => {
  const [contentType] = useQueryState('contentType');

  const form = useForm<FormType>({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      content: '',
      contentType: (contentType as string) || '',
    },
    resolver: zodResolver(documentValidationSchema),
  });

  return { form };
};

export { useDocumentForm };
