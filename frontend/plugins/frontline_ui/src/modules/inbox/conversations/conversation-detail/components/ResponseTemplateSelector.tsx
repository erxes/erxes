import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import {
  Popover,
  Input,
  Select,
  Skeleton,
  Button,
  DropdownMenu,
  Combobox,
  Command,
  cn,
} from 'erxes-ui';
import { useState, useMemo, ReactNode } from 'react';
import { useDebounce } from 'use-debounce';
import {
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconFilter,
} from '@tabler/icons-react';
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

      <Popover.Content className="w-96 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Response Templates</h3>
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleViewMode}
                variant={'ghost'}
                size="icon"
                className="p-1 rounded hover:bg-muted"
                title={getViewModeTitle(viewMode)}
              >
                <ViewModeIcon />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <IconFilter size={16} className="text-muted-foreground" />
              <SelectChannel.CommandBar
                mode="single"
                value={selectedChannel}
                onValueChange={(value) => setSelectedChannel(value as string)}
              />
            </div>
          </div>

          <Command>
            <Command.Input
              variant="secondary"
              focusOnMount
              placeholder="Search templates..."
              value={search}
              onValueChange={setSearch}
            />
            <Command.List
              className={cn(
                viewMode === 'grid'
                  ? '[&_div[cmdk-list-sizer]]:gap-2'
                  : 'space-y-2',
                '[&_div[cmdk-list-sizer]]:grid [&_div[cmdk-list-sizer]]:grid-cols-2 mt-2 max-h-80 overflow-y-auto',
              )}
            >
              {filteredTemplates.length === 0 ? (
                <div className="col-span-2 p-4 text-center text-muted-foreground">
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
                        ? 'h-24 col-span-1'
                        : 'col-span-2 h-auto',
                    )}
                  >
                    <Command.Item
                      value={template._id}
                      onSelect={() => handleSelectTemplate(template.content)}
                      className={cn(
                        {
                          'flex-row items-center': viewMode === 'list',
                          'flex-col items-start': viewMode === 'grid',
                        },
                        'flex p-2 rounded h-full gap-0.5',
                      )}
                    >
                      <div className="font-medium shrink basis-1/4">
                        {template.name}
                      </div>
                      <div className="text-sm text-muted-foreground flex-1 line-clamp-2">
                        {getPreviewText(template.content)}
                      </div>
                      {template.channelId && (
                        <div
                          className={cn(
                            { '-order-1': viewMode === 'grid' },
                            'text-xs text-primary mt-1 shrink',
                          )}
                        >
                          <ChannelsInline
                            showIcon={true}
                            channelIds={[template.channelId]}
                          />
                        </div>
                      )}
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
