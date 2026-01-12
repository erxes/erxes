import { useForm } from 'react-hook-form';
import { TCreateCustomerForm } from '../types';
import { createCustomerSchema } from '../../schema';
import { zodResolver } from '@hookform/resolvers/zod';

export const useCreateCustomerForm = () => {
  const form = useForm<TCreateCustomerForm>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      type: undefined,
    },
  });
  return { form };
};
