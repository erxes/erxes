import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { ISegment, ListQueryResponse, SEGMENTS } from 'ui-modules';
import { generateOrderPath } from '@/segments/utils/segmentsUtils';

export const useSegments = () => {
  const [selectedContentType] = useQueryState('contentType');

  const { data, loading, fetchMore } = useQuery<ListQueryResponse>(SEGMENTS, {
    variables: { contentTypes: [selectedContentType] },
  });

  const { segments = [] } = data || {};

  const orderedSegments = useMemo(
    () => generateOrderPath(segments),
    [segments],
  );

  const handleRefresh = useCallback(() => {
    fetchMore({
      variables: { contentTypes: [selectedContentType] },
      updateQuery: (prev, { fetchMoreResult }) => {
        return fetchMoreResult || prev;
      },
    });
  }, [fetchMore, selectedContentType]);

  return {
    orderedSegments,
    handleRefresh,
    loading,
  };
};
