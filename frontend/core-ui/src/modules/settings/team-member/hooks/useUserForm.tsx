import { useForm } from 'react-hook-form';
import { TUserDetailForm, TUserForm } from '@/settings/team-member/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  USER_DETAIL_SCHEMA,
  USER_SUBMIT_SCHEMA,
} from '@/settings/team-member/schema/users';

const useUsersSubmitForm = () => {
  const methods = useForm<TUserForm>({
    mode: 'onBlur',
    resolver: zodResolver(USER_SUBMIT_SCHEMA),
    defaultValues: {
      entries: Array.from({ length: 1 }, () => ({
        email: undefined,
        password: undefined,
        groupId: '',
        channelIds: undefined,
        unitId: undefined,
        branchId: undefined,
        departmentId: undefined,
      })),
    },
  });
  return {
    methods,
  };
};

const useUsersForm = () => {
  const methods = useForm<TUserDetailForm>({
    mode: 'onBlur',
    resolver: zodResolver(USER_DETAIL_SCHEMA),
    defaultValues: {
      email: '',
      username: '',
      positionIds: [],
    },
  });
  return {
    methods,
  };
};

export { useUsersSubmitForm, useUsersForm };
