import { USERS_GROUP_FORM_SCHEAMA } from '@/settings/permission/schema/usersGroup';
import { IUsersGroupFormSchema } from '@/settings/permission/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useUsersGroupForm = () => {
  const form = useForm<IUsersGroupFormSchema>({
    mode: 'onBlur',
    resolver: zodResolver(USERS_GROUP_FORM_SCHEAMA),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  return {
    form,
  };
};
