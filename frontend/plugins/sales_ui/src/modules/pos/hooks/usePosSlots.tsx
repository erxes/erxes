import { useMutation, useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { mutations, queries } from '@/pos/graphql';
import { toSlotInputs, toSlotNodes } from '@/pos/slot/slotNodes';
import type { SlotNode } from '@/pos/slot/types';

export const usePosSlots = (posId: string) => {
  const { data, loading, error } = useQuery(queries.posSlots, {
    variables: { posId },
    skip: !posId,
    fetchPolicy: 'cache-and-network',
  });
  const [saveMutation, { loading: saving }] = useMutation(mutations.saveSlots, {
    refetchQueries: ['posSlots'],
    awaitRefetchQueries: true,
  });

  const slots = useMemo(
    () => (data ? toSlotNodes(data.posSlots) : undefined),
    [data],
  );

  const saveSlots = useCallback(
    (nodes: SlotNode[]) =>
      saveMutation({ variables: { posId, slots: toSlotInputs(nodes, posId) } }),
    [posId, saveMutation],
  );

  return { slots, loading: loading && !data, error, saving, saveSlots };
};
