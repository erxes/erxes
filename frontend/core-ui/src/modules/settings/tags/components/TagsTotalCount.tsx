import { Skeleton, useMultiQueryState } from 'erxes-ui';
import { useTags } from 'ui-modules';

export const TagsTotalCount = () => {
  const [queries] = useMultiQueryState<{
    contentType: string;
    searchValue: string;
  }>(['contentType', 'searchValue']);
  const { contentType, searchValue } = queries;
  const { loading, totalCount } = useTags({
    variables: {
      type: contentType || '',
      searchValue: searchValue ?? undefined,
    },
  });
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount
        ? `${totalCount} records found`
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
};
