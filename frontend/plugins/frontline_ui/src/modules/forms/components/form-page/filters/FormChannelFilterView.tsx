import { useFormsChannelList } from '@/forms/hooks/useFormsChannelList';
import { useFormsFilterCounts } from '@/forms/hooks/useFormsFilterCounts';
import { IconCheck } from '@tabler/icons-react';
import {
  Command,
  Filter,
  Skeleton,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

export const FormChannelFilterView = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const [channelId, setChannelId] = useQueryState<string>('channelId');
  const { resetFilterState } = useFilterContext();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { channels, loading } = useFormsChannelList(
    debouncedSearch || undefined,
  );
  const { byChannel } = useFormsFilterCounts();

  return (
    <Filter.View filterKey="channelId">
      <Command shouldFilter={false}>
        <Command.Input
          variant="secondary"
          focusOnMount
          placeholder={t('search-channels')}
          value={search}
          onValueChange={setSearch}
        />
        <Command.List className="max-h-[300px] overflow-y-auto">
          {loading && !channels ? (
            <div className="flex flex-col gap-1 p-1">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </div>
          ) : (
            <>
              <Command.Empty>{t('no-channels-found')}</Command.Empty>
              {channels?.map((channel) => (
                <Command.Item
                  key={channel._id}
                  value={channel._id}
                  onSelect={() => {
                    setChannelId(channel._id);
                    resetFilterState();
                  }}
                >
                  <span className="truncate">{channel.name}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {byChannel[channel._id] ?? 0}
                    </span>
                    {channelId === channel._id && <IconCheck />}
                  </span>
                </Command.Item>
              ))}
            </>
          )}
        </Command.List>
      </Command>
    </Filter.View>
  );
};
