import { useMutation } from '@apollo/client';
import { useCallback } from 'react';

import { AGENTS_MODEL_VERIFY } from '../graphql/connection';
import type {
  IAgentsModelVerifyData,
  IAgentsModelVerifyVariables,
} from '../graphql/connection';

/**
 * Checks a typed model id with a minimal server-side request through the
 * user's saved connection. Resolves to null when the provider accepts it,
 * otherwise to a readable, key-free reason for the picker to show.
 */
export const useAgentsModelVerify = (): ((
  provider: string,
  model: string,
) => Promise<string | null>) => {
  const [verify] = useMutation<
    IAgentsModelVerifyData,
    IAgentsModelVerifyVariables
  >(AGENTS_MODEL_VERIFY);

  return useCallback(
    async (provider: string, model: string) => {
      try {
        const { data } = await verify({ variables: { provider, model } });
        const result = data?.agentsModelVerify;

        if (result?.ok) {
          return null;
        }

        return result?.error || `Could not use "${model}".`;
      } catch (error: unknown) {
        return error instanceof Error
          ? error.message
          : `Could not check "${model}".`;
      }
    },
    [verify],
  );
};
