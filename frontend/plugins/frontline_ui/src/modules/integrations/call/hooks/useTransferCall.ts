import { useMutation, useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { QueryHookOptions } from '@apollo/client';
import { CALL_TRANSFER } from '@/integrations/call/graphql/mutations/callMutations';
import { CALL_EXTENSION_LIST } from '@/integrations/call/graphql/queries/callExtensionList';

export const useExtentionList = (options?: QueryHookOptions) => {
  const config = useAtomValue(callConfigAtom);

  const { data, loading } = useQuery<{
    callExtensionList: {
      _id: string;
      extension: string;
      fullname: string;
      status: string;
    }[];
  }>(CALL_EXTENSION_LIST, {
    fetchPolicy: 'network-only',
    pollInterval: 8000,
    ...options,
    variables: {
      ...options?.variables,
      integrationId: config?.inboxId,
    },
  });

  const { callExtensionList } = data || {};

  return { callExtensionList, loading };
};

export const useTransferCall = () => {
  const [transferCall] = useMutation(CALL_TRANSFER, {
    refetchQueries: ['callExtensionList'],
  });
  return { transferCall };
};
