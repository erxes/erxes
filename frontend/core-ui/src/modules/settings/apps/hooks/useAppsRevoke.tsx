import { MutationHookOptions, useMutation } from '@apollo/client';
import { REVOKE_APP } from '../graphql';
import { IApp } from '../types';

export function useAppsRevoke(options?: MutationHookOptions<{ appsRevoke: IApp }, any>) {
  const [appsRevoke, { loading, error }] = useMutation(REVOKE_APP, {
    ...options,
  });

  return {
    appsRevoke,
    loading,
    error,
  };
}
