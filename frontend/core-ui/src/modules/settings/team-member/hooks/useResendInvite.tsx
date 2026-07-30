import { mutations } from '@/settings/team-member/graphql';
import { MutationFunctionOptions, useMutation } from '@apollo/client';

type InviteResendResult = {
  usersResendInvitation: boolean;
};

type InviteResendVariables = {
  email: string;
};

export const useResendInvite = () => {
  const [mutate, { loading, error }] = useMutation<
    InviteResendResult,
    InviteResendVariables
  >(mutations.USERS_RESEND_INVITATION);

  const handleResend = (
    options: MutationFunctionOptions<InviteResendResult, InviteResendVariables>,
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

export const useResendInvites = () => {
  const [mutate, { loading, error }] = useMutation<
    InviteResendResult,
    InviteResendVariables
  >(mutations.USERS_RESEND_INVITATION);

  const handleResendMany = async (emails: string[]) => {
    const results = await Promise.allSettled(
      emails.map((email) => mutate({ variables: { email } })),
    );

    const rejected = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    const firstError: unknown = rejected[0]?.reason;

    return {
      sent: results.length - rejected.length,
      failed: rejected.length,
      firstError: firstError instanceof Error ? firstError.message : undefined,
    };
  };

  return {
    resendMany: handleResendMany,
    loading,
    error,
  };
};
