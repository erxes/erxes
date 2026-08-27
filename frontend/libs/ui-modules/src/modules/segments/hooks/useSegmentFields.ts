import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { SEGMENT_FIELDS_QUERY } from '../graphql/queries';
import { TSegmentField } from '../types/segmentNode';

/**
 * The fields a segment on this content type may filter by, declared by the
 * plugin that owns it. The form renders from this alone - it never guesses an
 * operator list from a field's type.
 */
export const useSegmentFields = (contentType?: string) => {
  const { data, loading, error } = useQuery<{
    segmentFields: TSegmentField[];
  }>(SEGMENT_FIELDS_QUERY, {
    variables: { contentType },
    skip: !contentType,
  });

  // A stable array identity keeps the pickers from rebuilding their option
  // lists on every parent render.
  const fields = useMemo(() => data?.segmentFields || [], [data]);

  const fieldByKey = useCallback(
    (key: string) => fields.find((field) => field.key === key),
    [fields],
  );

  return { fields, fieldByKey, loading, error };
};
