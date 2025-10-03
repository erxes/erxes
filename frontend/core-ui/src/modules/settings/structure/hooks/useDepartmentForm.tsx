import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TDepartmentForm } from '../types/department';
import { DEPARTMENT_SCHEMA } from '../schemas/departmentSchema';

export const useDepartmentForm = () => {
  const methods = useForm<TDepartmentForm>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      code: '',
      description: '',
      supervisorId: '',
      parentId: '',
      userIds: undefined,
    },
    resolver: zodResolver(DEPARTMENT_SCHEMA),
  });
  return {
    methods,
  };
};
