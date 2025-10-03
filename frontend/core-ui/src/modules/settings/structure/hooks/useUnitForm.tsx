import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TUnitForm } from '../types/unit';
import { UNIT_SCHEMA } from '../schemas/unitSchema';

export const useUnitForm = () => {
  const methods = useForm<TUnitForm>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      code: '',
      supervisorId: '',
      departmentId: '',
      userIds: undefined,
    },
    resolver: zodResolver(UNIT_SCHEMA),
  });
  return {
    methods,
  };
};
