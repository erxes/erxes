import React from 'react';
import { Skeleton, useQueryState } from 'erxes-ui';
import { useGetChannels } from '@/channels/hooks/useGetChannels';

export const ChannelsTotalCount = () => {
  const [searchValue] = useQueryState<string | null>('searchValue');
  const { channels, loading } = useGetChannels({
    variables: { name: searchValue || undefined },
  });
  const count = channels?.length ?? 0;
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {count
        ? `${count} records found`
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
};
