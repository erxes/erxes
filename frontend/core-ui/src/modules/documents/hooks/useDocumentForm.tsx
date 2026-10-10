import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const documentValidationSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  contentType: z.string().min(1, 'Content type is required'),
  commentData: z.string().optional(),
});

export type FormType = z.infer<typeof documentValidationSchema>;

const useDocumentForm = () => {
  const form = useForm<FormType>({
    mode: 'onSubmit',
    resolver: zodResolver(documentValidationSchema),
  });

  return { form };
};

export { useDocumentForm };
