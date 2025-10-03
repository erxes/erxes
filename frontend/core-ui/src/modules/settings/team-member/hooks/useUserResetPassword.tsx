import { mutations } from '@/settings/team-member/graphql';
import { MutationFunctionOptions, useMutation } from '@apollo/client';

type UserResetResult = {
  usersResetMemberPassword: {
    _id: string;
  };
};

export const useUserResetPassword = () => {
  const [mutate, { loading, error }] = useMutation<UserResetResult>(
    mutations.USERS_RESET_PASSWORD,
  );

  const handleReset = (
    options: MutationFunctionOptions<UserResetResult, any>,
  ) => {
    mutate({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
    });
  };
  return {
    resetPassword: handleReset,
    loading,
    error,
  };
};
