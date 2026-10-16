import { useMultiQueryState } from 'erxes-ui';
import { useFormsTotalCount } from '@/forms/hooks/useFormsTotalCount';

export const useFormsFilterCounts = () => {
  const [{ channelId, tagId, status, searchValue }] = useMultiQueryState<{
    channelId: string;
    tagId: string;
    status: string;
    searchValue: string;
  }>(['channelId', 'tagId', 'status', 'searchValue']);

  const { byChannel, byTag, loading } = useFormsTotalCount({
    variables: {
      channelId: channelId || undefined,
      tagId: tagId || undefined,
      status: status || undefined,
      searchValue: searchValue || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    byChannel: (byChannel || {}) as Record<string, number>,
    byTag: (byTag || {}) as Record<string, number>,
    loading,
  };
};
