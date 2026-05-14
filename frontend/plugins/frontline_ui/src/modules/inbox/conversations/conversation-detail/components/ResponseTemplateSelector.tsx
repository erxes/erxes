import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { Popover, Skeleton, Button, Command, cn } from 'erxes-ui';
import { useState, useMemo, ReactNode } from 'react';
import { useDebounce } from 'use-debounce';
import { IconLayoutGrid, IconList, IconFilter } from '@tabler/icons-react';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { IChannel } from '@/channels/types';
import { getPreviewText } from '@/inbox/types/inbox';
import type { TViewMode as ViewMode } from '../types';
import { useAtom, useAtomValue } from 'jotai';
import { responseListViewAtom } from '../states/responseTemplate';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { ChannelsInline } from '@/inbox/channel/components/ChannelsInline';

interface ResponseTemplate {
  _id: string;
  name: string;
  content: string;
  channelId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ChannelOption {
  id: string;
  name: string;
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [viewMode, setViewMode] = useAtom<ViewMode>(responseListViewAtom);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  const { channels, loading: channelsLoading } = useGetChannels();
  const { responses, loading: responsesLoading } = useGetResponses({
    variables: {
      filter: {
        channelId: selectedChannel === 'all' ? undefined : selectedChannel,
      },
    },
  });

  const availableChannels = useMemo<ChannelOption[]>(() => {
    if (!channels) return [];
    return channels.map((channel: IChannel) => ({
      id: channel._id,
      name: channel.name,
    }));
  }, [channels]);

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

  const handleSelectTemplate = (content: string): void => {
    onSelect(content);
    setIsOpen(false);
  };

  const toggleViewMode = (): void => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  if (channelsLoading || responsesLoading) {
    return <Skeleton className="w-32 h-4 mt-1" />;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Content className="w-full max-w-md min-w-sm p-4 shadow-xl border">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm">Response Templates</h3>
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleViewMode}
                variant={'ghost'}
                size="icon"
                className="h-8 w-8 rounded hover:bg-muted"
                title={getViewModeTitle(viewMode)}
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
              placeholder="Search templates..."
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
              {filteredTemplates.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-muted-foreground text-sm italic">
                  {search
                    ? 'No matching templates found'
                    : 'No templates available'}
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template._id}
                    className={cn(
                      viewMode === 'grid'
                        ? 'h-32 col-span-1'
                        : 'col-span-2 h-auto',
                    )}
                  >
                    <Command.Item
                      value={template._id}
                      onSelect={() => handleSelectTemplate(template.content)}
                      className={cn(
                        'flex rounded border border-transparent transition-all cursor-pointer h-full gap-2',
                        'hover:border-primary/20 hover:bg-accent/50',
                        {
                          'flex-row items-center p-2.5': viewMode === 'list',
                          'flex-col items-start p-3': viewMode === 'grid',
                        },
                      )}
                    >
                      {template.channelId && (
                        <div
                          className={cn(
                            'text-[11px] text-primary shrink bg-primary/10 px-1.5 py-0.5 rounded font-medium',
                            {
                              'mb-1 order-first': viewMode === 'grid',
                              'ml-auto order-last': viewMode === 'list',
                            },
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
                  </div>
                ))
              )}
            </Command.List>
          </Command>
        </div>
      </Popover.Content>
    </Popover>
  );
};
