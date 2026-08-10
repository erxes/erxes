import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { IChannelMember } from '@/channels/types';
import { Empty, RecordTable, useQueryState } from 'erxes-ui';
import { IconBrandTrello, IconSearchOff } from '@tabler/icons-react';
import { useMemo } from 'react';
import { ChannelsCommandBar } from './ChannelsCommandBar';
import { useChannelsColumns } from './ChannelsColumns';
import { useTranslation } from 'react-i18next';

export function Channels() {
  const { t } = useTranslation('frontline');
  const [searchValue] = useQueryState<string | null>('searchValue');
  const { channels, loading } = useGetChannels({
    variables: { name: searchValue || undefined },
  });
  const channelIds = useMemo(
    () => (channels ?? []).map((channel) => channel._id),
    [channels],
  );
  const { members } = useGetChannelMembers({ channelIds });

  const membersByChannel = useMemo(() => {
    const map: Record<string, IChannelMember[]> = {};
    for (const member of members ?? []) {
      (map[member.channelId] ||= []).push(member);
    }
    return map;
  }, [members]);

  const channelsColumns = useChannelsColumns(membersByChannel);

  if (!loading && (!channels || channels.length === 0)) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            {searchValue ? <IconSearchOff /> : <IconBrandTrello />}
          </Empty.Media>
          <Empty.Title>
            {searchValue
              ? t('no-results-found', 'No results found')
              : t('no-channels-found', 'No channels found')}
          </Empty.Title>
          <Empty.Description>
            {searchValue
              ? t('try-different-search-term', 'Try a different search term')
              : t(
                  'no-channels-description',
                  'Create a channel to start organizing your team.',
                )}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={channelsColumns}
      data={channels ?? []}
      stickyColumns={['more', 'checkbox', 'name']}
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
      <ChannelsCommandBar />
    </RecordTable.Provider>
  );
}
