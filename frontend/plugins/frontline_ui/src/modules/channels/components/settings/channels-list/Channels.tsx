import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { IChannelMember, ChannelHotKeyScope } from '@/channels/types';
import { Input, Kbd, Skeleton, useScopedHotkeys, useQueryState } from 'erxes-ui';
import {
  IconBrandTrello,
  IconSearch,
  IconSearchOff,
  IconX,
} from '@tabler/icons-react';
import { useMemo, useState, useRef } from 'react';
import { ChannelCard } from './ChannelCard';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';


export function Channels() {
  const { t } = useTranslation('frontline');
  const [searchValue] = useQueryState<string | null>('searchValue');
  const { channels, loading } = useGetChannels({
    variables: { name: searchValue || undefined },
  });

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 150);
  const inputRef = useRef<HTMLInputElement>(null);

  useScopedHotkeys(
    'mod+k',
    () => inputRef.current?.focus(),
    ChannelHotKeyScope.ChannelSettingsPage,
  );

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

  const filteredChannels = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return channels ?? [];
    return (channels ?? []).filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false),
    );
  }, [channels, debouncedQuery]);

  if (loading && (!channels || channels.length === 0)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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
              {t('no-channels-found')}
            </h2>
            <p className="text-md text-muted-foreground mb-4">
              {t('no-channels-description')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const channelCount = channels?.length ?? 0;
  const isFiltering = debouncedQuery.trim().length > 0;

  return (
    <div className="overflow-auto h-full">
      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-sm font-medium text-foreground shrink-0">
            All channels
            <span className="ml-1.5 text-muted-foreground">{channelCount}</span>
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <IconSearch
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search channels…"
                className="h-[34px] w-52 rounded-[7px] pl-7 text-[13px]"
                style={{ paddingRight: query ? 28 : 56 }}
              />

              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
                >
                  <IconX size={12} />
                </button>
              ) : (
                <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                  <Kbd variant="foreground">⌘K</Kbd>
                </div>
              )}
            </div>

            {isFiltering && (
              <span className="text-xs text-muted-foreground shrink-0">
                {filteredChannels.length} found
              </span>
            )}
          </div>
        </div>

        {isFiltering && filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <IconSearchOff
              size={48}
              stroke={1.5}
              className="text-muted-foreground"
            />
            <p className="text-sm font-medium text-accent-foreground">
              No channels match &ldquo;{debouncedQuery}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground">
              Try a different term or{' '}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              >
                clear the search
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel._id}
                channel={channel}
                members={membersByChannel[channel._id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
