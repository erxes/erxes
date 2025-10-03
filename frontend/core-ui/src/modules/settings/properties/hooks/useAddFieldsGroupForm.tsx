import { propertyGroupSchema } from '@/settings/properties/schema';
import { IPropertyGroupForm } from '@/settings/properties/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useAddFieldsGroupForm = () => {
  const form = useForm<IPropertyGroupForm>({
    mode: 'onBlur',
    resolver: zodResolver(propertyGroupSchema),
  });
  return {
    methods: form,
  };
};
