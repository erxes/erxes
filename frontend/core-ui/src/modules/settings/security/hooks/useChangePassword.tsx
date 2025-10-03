import { USER_CHANGE_PASSWORD } from '@/settings/security/graphql/mutations/change-password';
import { ChangePasswordResult } from '@/settings/security/types';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import React from 'react';

export const useChangePassword = () => {
  const [mutate, { loading, error }] =
    useMutation<ChangePasswordResult>(USER_CHANGE_PASSWORD);

  const handleChangePassword = (
    options: MutationFunctionOptions<ChangePasswordResult, any>,
  ) => {
    mutate({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
    });
  };
  return {
    changePassword: handleChangePassword,
    loading,
    error,
  };
};
