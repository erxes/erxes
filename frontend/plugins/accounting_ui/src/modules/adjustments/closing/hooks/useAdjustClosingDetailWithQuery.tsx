import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('accounting');
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
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  }, [adjustClosingDetail, loading, error, t]);

  return { adjustClosingDetail, loading, error };
};
