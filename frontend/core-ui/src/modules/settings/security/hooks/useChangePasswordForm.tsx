import { CHANGE_PASSWORD_SCHEMA } from '@/settings/security/schema';
import { IChangePassword } from '@/settings/security/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useChangePasswordForm = () => {
  const form = useForm<IChangePassword>({
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      reTypeNewPassword: '',
    },
    resolver: zodResolver(CHANGE_PASSWORD_SCHEMA),
  });
  return {
    form,
  };
};
