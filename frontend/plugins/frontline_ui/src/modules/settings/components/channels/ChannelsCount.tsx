import { Skeleton } from 'erxes-ui';
import { useChannels } from '../../hooks/useChannels';

export function ChannelsCount() {
  const { totalCount, loading } = useChannels();

  return (
    <span className="text-sm text-muted-foreground">
      {loading ? <Skeleton className="size-4" /> : `(${totalCount})`}
    </span>
  );
}
