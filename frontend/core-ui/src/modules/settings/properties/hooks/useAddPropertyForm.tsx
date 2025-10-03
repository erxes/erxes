import { propertySchema } from '@/settings/properties/schema';
import { IPropertyForm } from '@/settings/properties/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useAddPropertyForm = () => {
  const form = useForm<IPropertyForm>({
    mode: 'onBlur',
    resolver: zodResolver(propertySchema),
  });
  return {
    methods: form,
  };
};
