import { propertySchema } from '@/properties/propertySchema';
import { IPropertyForm } from '@/properties/types/Properties';
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
