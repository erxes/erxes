import { Skeleton } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useQueryState } from 'erxes-ui';
import { useFields } from 'ui-modules';

export const PropertiesCount = () => {
  const { type: contentType } = useParams<{ type: string }>();
  const [groupId] = useQueryState<string>('groupId');
  const { totalCount, loading } = useFields({
    contentType: contentType || '',
    groupId: groupId || undefined,
  });

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount
        ? `${totalCount} records found`
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
};
