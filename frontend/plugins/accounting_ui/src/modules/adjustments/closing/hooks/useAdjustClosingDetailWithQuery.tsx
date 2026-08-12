import { QueryHookOptions } from '@apollo/client';
import { IAdjustClosingDetail } from '../types/AdjustClosing';
import { toast, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { renderingAdjustClosingDetailAtom } from '../types/adjustClosingDetailStates';
import { useAdjustClosingDetail } from './useAdjustClosingDetail';
import { useEffect } from 'react';

export const useAdjustClosingDetailWithQuery = (
  options?: QueryHookOptions<{ adjustClosingDetail: IAdjustClosingDetail }>,
) => {
  const [_id] = useQueryState('adjustClosingId');
  const setRendering = useSetAtom(renderingAdjustClosingDetailAtom);

  const { adjustClosingDetail, loading, error } = useAdjustClosingDetail({
    ...options,
    variables: { _id },
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
