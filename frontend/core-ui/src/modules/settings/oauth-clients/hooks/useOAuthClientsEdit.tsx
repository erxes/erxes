import { MutationHookOptions, useMutation } from '@apollo/client';
import { EDIT_OAUTH_CLIENT } from '../graphql';
import { IOAuthClientApp } from '../types';

export function useOAuthClientsEdit(
  options?: MutationHookOptions<{ oauthClientAppsEdit: IOAuthClientApp }, any>,
) {
  const [oauthClientAppsEdit, { loading, error }] = useMutation(
    EDIT_OAUTH_CLIENT,
    {
      ...options,
    },
  );

  return {
    oauthClientAppsEdit,
    loading,
    error,
  };
}
