'use client';

import { useMergeDeals } from './useMergeDeals';
import { useSearchParams } from 'react-router-dom';

/**
 * "Merge mode" is driven entirely by URL query params so it survives closing
 * the deal detail and works directly on the real board:
 *   ?mergeTargetId=<deal>&mergeName=<name>
 *
 * While active, clicking any deal card on the board merges that deal into the
 * target deal (under the chosen name) instead of opening it.
 *
 * NOTE: all param writes go through a SINGLE setSearchParams call. erxes-ui's
 * useQueryState writes each key with its own snapshot, so chaining several of
 * them in one handler clobbers the earlier writes — which silently dropped the
 * merge params before.
 */
export const useMergeMode = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mergeDeals, loading } = useMergeDeals();

  const mergeTargetId = searchParams.get('mergeTargetId');
  const mergeName = searchParams.get('mergeName');

  /** Enter merge mode targeting `targetId`, closing the open deal detail. */
  const startMerge = (targetId: string, name: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('mergeTargetId', targetId);
    next.set('mergeName', name);
    // Close the deal detail so the board behind it is clickable.
    next.delete('salesItemId');
    setSearchParams(next);
  };

  /** Leave merge mode by clearing the merge query params. */
  const cancelMerge = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('mergeTargetId');
    next.delete('mergeName');
    setSearchParams(next);
  };

  /** Merge `sourceDealId` into the current target deal, then exit merge mode. */
  const mergeInto = (sourceDealId: string) => {
    if (!mergeTargetId || sourceDealId === mergeTargetId) {
      return;
    }
    mergeDeals({
      variables: {
        sourceDealIds: [sourceDealId],
        targetDealId: mergeTargetId,
        name: mergeName || '',
      },
    }).finally(() => cancelMerge());
  };

  return {
    isMergeMode: Boolean(mergeTargetId),
    mergeTargetId,
    mergeName,
    startMerge,
    cancelMerge,
    mergeInto,
    loading,
  };
};
