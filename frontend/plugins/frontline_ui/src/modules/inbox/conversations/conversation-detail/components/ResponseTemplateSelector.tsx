import { useGetResponses, RESPONSES_PER_PAGE } from '@/responseTemplate/hooks/useGetResponses';
import { Popover, Skeleton, Button, Command, cn, EnumCursorDirection } from 'erxes-ui';
import { useState, useMemo, ReactNode, useRef, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { IconLayoutGrid, IconList, IconFilter } from '@tabler/icons-react';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { getPreviewText } from '@/inbox/types/inbox';
import type { TViewMode as ViewMode } from '../types';
import { useAtom, useAtomValue } from 'jotai';
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

const ViewModeIcon = (): JSX.Element => {
  const viewMode = useAtomValue(responseListViewAtom);
  switch (viewMode) {
    case 'grid':
      return <IconLayoutGrid size={16} />;
    default:
      return <IconList size={16} />;
  }
};

const getViewModeTitle = (viewMode: ViewMode): string => {
  return `Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`;
};

export const ResponseTemplateSelector: React.FC<
  ResponseTemplateSelectorProps
> = ({ onSelect, children }) => {
  const { t } = useTranslation('frontline');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [viewMode, setViewMode] = useAtom<ViewMode>(responseListViewAtom);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const { channels, loading: channelsLoading } = useGetChannels();
  const {
    responses,
    isInitialLoad: responsesInitialLoad,
    handleFetchMore,
    pageInfo,
    refetch,
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
  }, [responses]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollContainer = containerRef.current?.querySelector(
      '[cmdk-list]',
    ) as Element | null;

    if (!sentinel || !scrollContainer || !pageInfo?.hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingRef.current) {
          isFetchingRef.current = true;
          handleFetchMore({ direction: EnumCursorDirection.FORWARD });
        }
      },
      { root: scrollContainer, rootMargin: '0px 0px 80px 0px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pageInfo?.hasNextPage, handleFetchMore, filteredTemplates.length]);

  const handleSelectTemplate = (content: string): void => {
    onSelect(content);
    setIsOpen(false);
  };

  const toggleViewMode = (): void => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  const isInitialLoad = (channelsLoading && !channels) || (responsesInitialLoad && !responses);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Content className="w-full max-w-md min-w-sm p-4 shadow-xl border">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm">{t('response-templates')}</h3>
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleViewMode}
                variant={'ghost'}
                size="icon"
                className="h-8 w-8 rounded hover:bg-muted"
                title={viewMode === 'grid' ? t('switch-to-list-view') : t('switch-to-grid-view')}
              >
                <ViewModeIcon />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 bg-muted/30 p-1 rounded">
              <IconFilter size={14} className="text-muted-foreground ml-1" />
              <div className="flex-1">
                <SelectChannel.CommandBar
                  mode="single"
                  value={selectedChannel}
                  onValueChange={(value) => setSelectedChannel(value as string)}
                />
              </div>
            </div>
          </div>

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
                    <div className="col-span-2 pt-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() =>
                          handleFetchMore({
                            direction: EnumCursorDirection.FORWARD,
                          })
                        }
                      >
                        {t('load-more')}
                      </Button>
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
