import { mutations } from '@/settings/team-member/graphql';
import { MutationFunctionOptions, useMutation } from '@apollo/client';

type InviteResendResult = {
  usersResendInvitation: boolean;
};

export const useResendInvite = () => {
  const [mutate, { loading, error }] = useMutation<InviteResendResult>(
    mutations.USERS_RESEND_INVITATION,
  );

  const handleResend = (
    options: MutationFunctionOptions<InviteResendResult, any>,
  ) => {
    mutate({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
    });
  };
  return {
    resend: handleResend,
    loading,
    error,
  };
};
