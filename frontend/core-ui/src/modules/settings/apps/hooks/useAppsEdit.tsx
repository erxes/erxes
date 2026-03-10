import { MutationHookOptions, useMutation } from '@apollo/client';
import { EDIT_APP } from '../graphql';
import { IApp } from '../types';

export function useAppsEdit(options?: MutationHookOptions<{ appsEdit: IApp }, any>) {
  const [appsEdit, { loading, error }] = useMutation(EDIT_APP, {
    ...options,
  });

  return {
    appsEdit,
    loading,
    error,
  };
}
