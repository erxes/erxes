import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { SEGMENT_FIELDS_QUERY } from '../graphql/queries';
import { TSegmentField } from '../types/segmentNode';

export const useSegmentFields = (contentType?: string) => {
  const { data, loading, error } = useQuery<{
    segmentFields: TSegmentField[];
  }>(SEGMENT_FIELDS_QUERY, {
    variables: { contentType },
    skip: !contentType,
  });

  const fields = useMemo(() => data?.segmentFields || [], [data]);

  const fieldByKey = useCallback(
    (key: string) => fields.find((field) => field.key === key),
    [fields],
  );

  return { fields, fieldByKey, loading, error };
};
