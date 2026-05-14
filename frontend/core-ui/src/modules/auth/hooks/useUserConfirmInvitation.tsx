import { useMutation } from '@apollo/client';
import { USER_CONFIRM_INVITATION } from '@/auth/graphql/mutations/userConfirmInvitation';

export const useUserConfirmInvitation = () => {
  const [confirmInvitation, { loading, error }] = useMutation(USER_CONFIRM_INVITATION);

  return {
    confirmInvitation,
    loading,
    error,
  };
};
