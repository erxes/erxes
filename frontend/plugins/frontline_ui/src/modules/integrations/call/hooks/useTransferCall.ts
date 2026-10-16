import { CALL_TRANSFER } from '@/integrations/call/graphql/mutations/callMutations';
import { CALL_EXTENSION_LIST } from '@/integrations/call/graphql/queries/callExtensionList';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import type {
  CallExtensionListQuery,
  CallExtensionListQueryVariables,
} from '~/gql/graphql';

export const useExtentionList = (
  options?: QueryHookOptions<
    CallExtensionListQuery,
    CallExtensionListQueryVariables
  >,
) => {
  const config = useAtomValue(callConfigAtom);
  const integrationId = config?.inboxId;

  const { data, loading } = useQuery(CALL_EXTENSION_LIST, {
    fetchPolicy: 'network-only',
    pollInterval: 8000,
    ...options,
    variables: integrationId
      ? { ...options?.variables, integrationId }
      : undefined,
    skip: !integrationId || options?.skip,
  });

  const callExtensionList = data?.callExtensionList?.filter(isDefined);

  return { callExtensionList, loading };
};

export const useTransferCall = () => {
  const [transferCall] = useMutation(CALL_TRANSFER, {
    refetchQueries: [CALL_EXTENSION_LIST],
  });
  return { transferCall };
};
