import { MutationHookOptions, useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import { AddPosDetailResult, AddPosDetailVariables } from '../types/mutations';

export function usePosAdd(
  options?: MutationHookOptions<AddPosDetailResult, AddPosDetailVariables>,
) {
  const [posAdd, { loading, error }] = useMutation<
    AddPosDetailResult,
    AddPosDetailVariables
  >(mutations.posAdd, {
    ...options,
    refetchQueries: [
      'salesPosSettingsList',
      'salesPosNavigationList',
      'salesPosOrdersPosList',
      'salesPosByItemsPosList',
      'salesPosCoversPosList',
      'salesPosItemsPosList',
      'salesPosSummaryPosList',
      'posList', // Still used by the Mongolian plugin's POS sync screens.
    ],
  });

  return { posAdd, loading, error };
}
