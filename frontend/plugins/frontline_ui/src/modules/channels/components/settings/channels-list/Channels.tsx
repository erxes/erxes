import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useQueryState, RecordTable } from 'erxes-ui';
import { IconBrandTrello } from '@tabler/icons-react';
import { channelsColumns } from './ChannelsColumns';

export function Channels() {
  const [searchValue] = useQueryState<string | null>('searchValue');
  const { channels, loading } = useGetChannels({
    variables: { name: searchValue || undefined },
  });
  if (!loading && (!channels || channels.length === 0)) {
    return (
      <div className="overflow-hidden h-full px-8 flex flex-col">
        <div className="bg-sidebar size-full border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
          <div className="size-full flex flex-col items-center justify-center">
            <IconBrandTrello
              size={64}
              stroke={1.5}
              className="text-muted-foreground"
            />
            <h2 className="text-lg font-semibold text-accent-foreground">
              No channels found
            </h2>
            <p className="text-md text-muted-foreground mb-4">
              Create a channel to start organizing your team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={channelsColumns}
      data={channels ?? []}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
}
