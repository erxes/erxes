import { MutationHookOptions, useMutation } from '@apollo/client';
import { REVOKE_OAUTH_CLIENT } from '../graphql';
import { IOAuthClientApp } from '../types';

export function useOAuthClientsRevoke(
  options?: MutationHookOptions<
    { oauthClientAppsRevoke: IOAuthClientApp },
    any
  >,
) {
  const [oauthClientAppsRevoke, { loading, error }] = useMutation(
    REVOKE_OAUTH_CLIENT,
    {
      ...options,
    },
  );

  return {
    oauthClientAppsRevoke,
    loading,
    error,
  };
}
