import {
  useGetResponses,
  RESPONSES_PER_PAGE,
} from '@/responseTemplate/hooks/useGetResponses';
import {
  Badge,
  Popover,
  Skeleton,
  Spinner,
  Command,
  ToggleGroup,
  cn,
  EnumCursorDirection,
  isUndefinedOrNull,
} from 'erxes-ui';
import { useState, useMemo, ReactNode, useRef, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { getPreviewText } from '@/inbox/types/inbox';
import type { TViewMode as ViewMode } from '../types';
import { useAtom } from 'jotai';
import { responseListViewAtom } from '../states/responseTemplate';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { ChannelsInline } from '@/inbox/channel/components/ChannelsInline';
import { useTranslation } from 'react-i18next';

interface ResponseTemplate {
  _id: string;
  name: string;
  content: string;
  channelId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ResponseTemplateSelectorProps {
  onSelect: (content: string) => void;
  children: ReactNode;
}

export const ResponseTemplateSelector: React.FC<
  ResponseTemplateSelectorProps
> = ({ onSelect, children }) => {
  const { t } = useTranslation('frontline');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [viewMode, setViewMode] = useAtom<ViewMode>(responseListViewAtom);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isFetchingRef = useRef(false);

  const { channels, loading: channelsLoading } = useGetChannels();
  const {
    responses,
    isInitialLoad: responsesInitialLoad,
    isRefetching: responsesRefetching,
    handleFetchMore,
    pageInfo,
    refetch,
    totalCount,
  } = useGetResponses({
    variables: {
      filter: {
        channelId: selectedChannel === 'all' ? undefined : selectedChannel,
        searchValue: debouncedSearch || undefined,
      },
    },
  });

  useEffect(() => {
    refetch({
      filter: {
        limit: RESPONSES_PER_PAGE,
        orderBy: { createdAt: -1 },
        channelId: selectedChannel === 'all' ? undefined : selectedChannel,
        searchValue: debouncedSearch || undefined,
      },
    });
  }, [debouncedSearch, selectedChannel, refetch]);

  const filteredTemplates = useMemo<ResponseTemplate[]>(() => {
    if (!responses) return [];

    const searchLower = debouncedSearch.toLowerCase();

    return responses.filter((template: ResponseTemplate) => {
      const templateContent = getPreviewText(template.content).toLowerCase();
      const matchesSearch =
        debouncedSearch === '' ||
        template.name.toLowerCase().includes(searchLower) ||
        templateContent.includes(searchLower);

      const matchesChannel =
        selectedChannel === 'all' || template.channelId === selectedChannel;

      return matchesSearch && matchesChannel;
    });
  }, [responses, debouncedSearch, selectedChannel]);

  useEffect(() => {
    isFetchingRef.current = false;
    setIsFetchingMore(false);
  }, [responses]);

  const { ref: sentinelRef } = useInView({
    skip: !pageInfo?.hasNextPage,
    rootMargin: '80px 0px',
    onChange: (inView) => {
      if (!inView || isFetchingRef.current || !pageInfo?.hasNextPage) return;
      isFetchingRef.current = true;
      setIsFetchingMore(true);
      handleFetchMore({ direction: EnumCursorDirection.FORWARD });
    },
  });

  const handleSelectTemplate = (content: string): void => {
    onSelect(content);
    setIsOpen(false);
  };

  const isInitialLoad =
    (channelsLoading && !channels) || (responsesInitialLoad && !responses);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Content className="w-full max-w-md min-w-sm p-3 shadow-xl border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">
                {t('response-templates')}
              </h3>
              {isUndefinedOrNull(totalCount) ||
              responsesInitialLoad ||
              responsesRefetching ? (
                <Skeleton className="w-6 h-4 rounded-sm" />
              ) : (
                <Badge variant="secondary">{totalCount}</Badge>
              )}
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
            >
              <ToggleGroup.Item
                value="list"
                aria-label={t('switch-to-list-view')}
                title={t('switch-to-list-view')}
              >
                <IconList size={14} />
              </ToggleGroup.Item>
              <ToggleGroup.Item
                value="grid"
                aria-label={t('switch-to-grid-view')}
                title={t('switch-to-grid-view')}
              >
                <IconLayoutGrid size={14} />
              </ToggleGroup.Item>
            </ToggleGroup>
          </div>

          <SelectChannel.CommandBar
            mode="single"
            value={selectedChannel}
            onValueChange={(value) => setSelectedChannel(value as string)}
          />

          <Command className="border rounded-md shadow-sm">
            <Command.Input
              variant="secondary"
              focusOnMount
              placeholder={t('search-templates')}
              value={search}
              onValueChange={setSearch}
            />
            <Command.List
              className={cn(
                'mt-2 max-h-72 overflow-y-auto pr-1',
                viewMode === 'grid'
                  ? '[&_div[cmdk-list-sizer]]:grid [&_div[cmdk-list-sizer]]:grid-cols-2 [&_div[cmdk-list-sizer]]:gap-2'
                  : 'space-y-1.5',
              )}
            >
              {isInitialLoad ? (
                <div className="col-span-2 p-4 space-y-2">
                  <Skeleton className="w-full h-10" />
                  <Skeleton className="w-full h-10" />
                  <Skeleton className="w-full h-10" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-muted-foreground text-sm italic">
                  {search
                    ? t('no-matching-templates')
                    : t('no-templates-available')}
                </div>
              ) : (
                <>
                  {filteredTemplates.map((template) => (
                    <Command.Item
                      key={template._id}
                      value={template._id}
                      onSelect={() => handleSelectTemplate(template.content)}
                      className={cn(
                        'flex rounded border border-transparent transition-all cursor-pointer gap-2',
                        'hover:border-primary/20 hover:bg-accent/50',
                        viewMode === 'grid'
                          ? 'h-32 col-span-1 flex-col items-start p-3 overflow-hidden w-full'
                          : 'col-span-2 h-auto flex-row items-center p-2.5',
                      )}
                    >
                      {template.channelId && (
                        <div
                          className={cn(
                            'text-[11px] text-primary shrink bg-primary/10 px-1.5 py-0.5 rounded font-medium',
                            viewMode === 'grid'
                              ? 'mb-1 order-first'
                              : 'ml-auto order-last',
                          )}
                        >
                          <ChannelsInline
                            showIcon={true}
                            channelIds={[template.channelId]}
                          />
                        </div>
                      )}

                      <div
                        className={cn('min-w-0 flex-1', {
                          'basis-1/3': viewMode === 'list',
                          'w-full overflow-hidden': viewMode === 'grid',
                        })}
                      >
                        <div className="font-semibold text-sm truncate leading-tight">
                          {template.name}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-snug">
                          {getPreviewText(template.content)}
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                  {pageInfo?.hasNextPage && (
                    <div
                      ref={sentinelRef}
                      className="col-span-2 flex items-center justify-center py-3"
                    >
                      {isFetchingMore && (
                        <Spinner size="sm" className="text-muted-foreground" />
                      )}
                    </div>
                  )}
                </>
              )}
            </Command.List>
          </Command>
        </div>
      </Popover.Content>
    </Popover>
  );
};
