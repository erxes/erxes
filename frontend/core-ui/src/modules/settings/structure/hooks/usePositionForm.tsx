import { useForm } from 'react-hook-form';
import { TPositionForm } from '../types/position';
import { zodResolver } from '@hookform/resolvers/zod';
import { POSITION_SCHEMA } from '../schemas/positionSchema';

export const usePositionForm = () => {
  const methods = useForm<TPositionForm>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      code: '',
      parentId: undefined,
      status: undefined,
      userIds: undefined,
    },
    resolver: zodResolver(POSITION_SCHEMA),
  });

  return {
    methods,
  };
};
