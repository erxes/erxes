import { DocumentNode, useQuery } from '@apollo/client';

// Network-only list fetch shared by the schedules and workflows index pages, so
// the table reflects edits. `selector` pulls the row array out of the response.
export const useResourceList = <TData, TItem>(
  query: DocumentNode,
  selector: (data?: TData) => TItem[],
) => {
  const { data, loading, refetch } = useQuery<TData>(query, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  return { items: selector(data), loading, refetch };
};
