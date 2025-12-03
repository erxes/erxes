import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { Popover, Input, Select, Skeleton } from 'erxes-ui';
import { useState, useMemo, ReactNode } from 'react';
import {
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconFilter,
} from '@tabler/icons-react';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { IChannel } from '@/channels/types';

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

type ViewMode = 'list' | 'grid';

interface ResponseTemplateSelectorProps {
  onSelect: (content: string) => void;
  children: ReactNode;
}

const getPreviewText = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return (
        parsed
          .map((block: any) => {
            if (block.content && Array.isArray(block.content)) {
              return block.content
                .filter((item: any) => item.type === 'text' && item.text)
                .map((item: any) => item.text)
                .join(' ');
            }
            return '';
          })
          .filter(Boolean)
          .join(' ') || 'Empty response'
      );
    }
  } catch (e) {
    console.error('Error parsing response template content:', e);
  }
  return content || 'Empty response';
};

const getViewModeIcon = (viewMode: ViewMode): JSX.Element => {
  return viewMode === 'grid' ? (
    <IconList size={16} />
  ) : (
    <IconLayoutGrid size={16} />
  );
};

const getViewModeTitle = (viewMode: ViewMode): string => {
  return `Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`;
};

export const ResponseTemplateSelector: React.FC<
  ResponseTemplateSelectorProps
> = ({ onSelect, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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

    const searchTermLower = searchTerm.toLowerCase();

    return responses.filter((template: ResponseTemplate) => {
      const templateContent = getPreviewText(template.content).toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        template.name.toLowerCase().includes(searchTermLower) ||
        templateContent.includes(searchTermLower);

      const matchesChannel =
        selectedChannel === 'all' || template.channelId === selectedChannel;

      return matchesSearch && matchesChannel;
    });
  }, [responses, searchTerm, selectedChannel]);

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
              <button
                onClick={toggleViewMode}
                className="p-1 rounded hover:bg-muted"
                title={getViewModeTitle(viewMode)}
              >
                {getViewModeIcon(viewMode)}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <IconSearch
                size={16}
                className="absolute left-2.5 top-2.5 text-muted-foreground"
              />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <IconFilter size={16} className="text-muted-foreground" />
              <Select
                value={selectedChannel}
                onValueChange={setSelectedChannel}
              >
                <Select.Trigger>
                  <Select.Value placeholder="All channels" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All Channels</Select.Item>
                  {availableChannels.map((channel) => (
                    <Select.Item key={channel.id} value={channel.id}>
                      {channel.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          <div
            className={`mt-2 max-h-80 overflow-y-auto ${
              viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'
            }`}
          >
            {filteredTemplates.length === 0 ? (
              <div className="col-span-2 p-4 text-center text-muted-foreground">
                {searchTerm
                  ? 'No matching templates found'
                  : 'No templates available'}
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template._id}
                  onClick={() => handleSelectTemplate(template.content)}
                  className={`text-left p-2 rounded hover:bg-muted ${
                    viewMode === 'grid' ? 'h-24' : ''
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {getPreviewText(template.content)}
                  </div>
                  {template.channelId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {
                        availableChannels.find(
                          (c) => c.id === template.channelId,
                        )?.name
                      }
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
};
