import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback } from 'react';
import {
  CONNECTIONS,
  CONNECTIONS_ADD,
  CONNECTIONS_EDIT,
  CONNECTIONS_REMOVE,
  CONNECTIONS_TEST,
} from '@/settings/connections/graphql';
import {
  IConnection,
  IConnectionFieldInput,
  IConnectionTestResult,
} from '@/settings/connections/types';

export interface IConnectionSaveInput {
  name: string;
  icon?: string;
  logo?: string;
  // Omitted on edit to keep the stored fields as they are.
  fields?: IConnectionFieldInput[];
}

// Adds and removes change the list; edits and tests update the normalized
// `Connection` entry in the cache from the mutation result.
const LIST_REFETCH = [{ query: CONNECTIONS }];

export const useConnectionsAdd = () => {
  const [mutate, { loading }] = useMutation<{ connectionsAdd: IConnection }>(
    CONNECTIONS_ADD,
    { refetchQueries: LIST_REFETCH, awaitRefetchQueries: true },
  );

  const addConnection = useCallback(
    async (input: IConnectionSaveInput & { type: string }) => {
      const { data } = await mutate({ variables: { input } });

      return data?.connectionsAdd;
    },
    [mutate],
  );

  return { addConnection, loading };
};

export const useConnectionsEdit = () => {
  const [mutate, { loading }] = useMutation<{ connectionsEdit: IConnection }>(
    CONNECTIONS_EDIT,
  );

  const editConnection = useCallback(
    async (_id: string, input: IConnectionSaveInput) => {
      const { data } = await mutate({ variables: { _id, input } });

      return data?.connectionsEdit;
    },
    [mutate],
  );

  return { editConnection, loading };
};

export const useConnectionsRemove = () => {
  const [mutate, { loading }] = useMutation(CONNECTIONS_REMOVE, {
    refetchQueries: LIST_REFETCH,
    awaitRefetchQueries: true,
  });

  const removeConnection = useCallback(
    (_id: string) => mutate({ variables: { _id } }),
    [mutate],
  );

  return { removeConnection, loading };
};

/** Tests a saved connection and reports the result in a toast. */
export const useConnectionsTest = () => {
  const { toast } = useToast();
  const [mutate, { loading }] = useMutation<{
    connectionsTest: IConnectionTestResult;
  }>(CONNECTIONS_TEST);

  const testConnection = useCallback(
    async (_id: string) => {
      try {
        const { data } = await mutate({ variables: { _id } });
        const result = data?.connectionsTest;

        toast({
          variant: result?.ok ? 'success' : 'destructive',
          title: result?.ok ? 'Connection works' : 'Connection test failed',
          description: result?.message || undefined,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Connection test failed',
          description: error instanceof Error ? error.message : undefined,
        });
      }
    },
    [mutate, toast],
  );

  return { testConnection, loading };
};
