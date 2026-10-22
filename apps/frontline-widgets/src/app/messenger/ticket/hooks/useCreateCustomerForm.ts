import { useForm } from 'react-hook-form';
import { TCreateCustomerForm } from '../types';
import { createCustomerSchema } from '../../schema';
import { zodResolver } from '@hookform/resolvers/zod';

export const useCreateCustomerForm = (
  defaultValues: Partial<TCreateCustomerForm> = {},
) => {
  const form = useForm<TCreateCustomerForm>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      type: 'email',
      ...defaultValues,
    },
  });
  return { form };
};
