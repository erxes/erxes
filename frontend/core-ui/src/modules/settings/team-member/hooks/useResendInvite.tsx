import { mutations } from '@/settings/team-member/graphql';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useState } from 'react';

type InviteResendResult = {
  usersResendInvitation: string;
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
  const [mutate, { error }] = useMutation<
    InviteResendResult,
    InviteResendVariables
  >(mutations.USERS_RESEND_INVITATION);
  const [loading, setLoading] = useState(false);

  const handleResendMany = async (emails: string[]) => {
    setLoading(true);

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        const { data } = await mutate({ variables: { email } });

        if (!data?.usersResendInvitation) {
          throw new Error('Invitation could not be resent');
        }
      }),
    ).finally(() => setLoading(false));

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
