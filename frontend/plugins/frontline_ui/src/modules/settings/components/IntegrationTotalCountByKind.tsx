import { Skeleton } from 'erxes-ui';
import { useIntegrationsCounts } from '../hooks/useIntegrationsCounts';

export const IntegrationTotalCountByKind = ({
  kind = undefined,
}: {
  kind?: string;
}) => {
  const { totalCount, loading } = useIntegrationsCounts({
    variables: {
      kind,
    },
  });

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? (
        <Skeleton className="size-4" />
      ) : (
        `(${totalCount || 'No results found'})`
      )}
    </span>
  );
};
