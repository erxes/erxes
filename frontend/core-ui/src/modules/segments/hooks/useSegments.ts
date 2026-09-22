import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { useCallback } from 'react';
import { ListQueryResponse, SEGMENTS } from 'ui-modules';

export const useSegments = () => {
  const [selectedContentType] = useQueryState('contentType');

  const { data, loading, fetchMore } = useQuery<ListQueryResponse>(SEGMENTS, {
    variables: { contentTypes: [selectedContentType] },
  });

  const { segments = [] } = data || {};

  const handleRefresh = useCallback(() => {
    fetchMore({
      variables: { contentTypes: [selectedContentType] },
      updateQuery: (prev, { fetchMoreResult }) => {
        return fetchMoreResult || prev;
      },
    });
  }, [fetchMore, selectedContentType]);

  return {
    segments,
    handleRefresh,
    loading,
  };
};
