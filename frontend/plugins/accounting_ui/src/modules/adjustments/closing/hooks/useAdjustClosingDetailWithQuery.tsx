import { QueryHookOptions } from '@apollo/client';

import { toast, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { renderingAdjustClosingDetailAtom } from '../types/adjustClosingDetailStates';
import { useAdjustClosingDetail } from './useAdjustClosingDetail';
import { useEffect } from 'react';
import type {
  AccountingAdjustClosingDetailQuery,
  AccountingAdjustClosingDetailQueryVariables,
} from '~/gql/graphql';

export const useAdjustClosingDetailWithQuery = (
  options?: QueryHookOptions<
    AccountingAdjustClosingDetailQuery,
    AccountingAdjustClosingDetailQueryVariables
  >,
) => {
  const [_id] = useQueryState<string>('adjustClosingId');
  const setRendering = useSetAtom(renderingAdjustClosingDetailAtom);

  const { adjustClosingDetail, loading, error } = useAdjustClosingDetail({
    ...options,
    variables: { _id: _id ?? '' },
    skip: !_id,
  });

  useEffect(() => {
    if (adjustClosingDetail || !loading || error) {
      setRendering(false);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  }, [adjustClosingDetail, loading, error]);

  return { adjustClosingDetail, loading, error };
};
