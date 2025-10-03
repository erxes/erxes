import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BRANDS_FORM_SCHEMA } from '../schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { TBrandsForm } from '../types';

export const useBrandsForm = () => {
  const methods = useForm<TBrandsForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      description: '',
    },
    resolver: zodResolver(BRANDS_FORM_SCHEMA),
  });
  return {
    methods,
  };
};
