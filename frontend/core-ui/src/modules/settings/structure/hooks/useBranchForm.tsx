import { useForm } from 'react-hook-form';
import { TBranchForm } from '../types/branch';
import { zodResolver } from '@hookform/resolvers/zod';
import { BRANCH_CREATE_SCHEMA } from '../schemas/branchSchema';

export const useBranchForm = () => {
  const methods = useForm<TBranchForm>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      address: '',
      code: '',
    },
    resolver: zodResolver(BRANCH_CREATE_SCHEMA),
  });
  return {
    methods,
  };
};
