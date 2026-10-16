import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { queries } from '../graphql/queries';
import { toPosDetail } from '../utils/posJson';

export const usePosDetail = (posId?: string) => {
  const { data, loading, error } = useQuery(queries.posDetail, {
    variables: posId ? { _id: posId } : undefined,
    skip: !posId,
  });
  const parsed = useMemo(() => {
    try {
      return {
        posDetail: data?.posDetail ? toPosDetail(data.posDetail) : undefined,
      };
    } catch (cause) {
      return {
        error: cause instanceof Error ? cause : new Error(String(cause)),
      };
    }
  }, [data?.posDetail]);

  return { posDetail: parsed.posDetail, loading, error: error ?? parsed.error };
};
