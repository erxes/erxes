import { formatDistanceToNow } from 'date-fns';
import { Popover } from 'erxes-ui';
import { IChannel } from '@/channels/types';

interface TemplateSuggestion {
  _id: string;
  name: string;
  content: string;
  channelId?: string;
  updatedAt?: string;
  preview?: string;
}

interface ResponseTemplateDropdownProps {
  suggestions: TemplateSuggestion[];
  selectedIndex: number;
  availableChannels?: IChannel[];
  onSelect: (content: string, templateId?: string) => void;
}

export const ResponseTemplateDropdown = ({
  suggestions,
  selectedIndex,
  availableChannels = [],
  onSelect,
}: ResponseTemplateDropdownProps) => (
  <Popover open>
    <Popover.Anchor asChild>
      <span className="sr-only" />
    </Popover.Anchor>
    <Popover.Content
      sideOffset={20}
      side="top"
      align="start"
      onOpenAutoFocus={(e) => e.preventDefault()}
      className="p-0 min-w-[300px] overflow-hidden"
    >
      <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-10 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Response Templates
      </div>

      {suggestions.map((suggestion, index) => {
        const isSelected = index === selectedIndex;
        const channelName = availableChannels.find(
          (c) => c._id === suggestion.channelId,
        )?.name;

        return (
          <div
            key={suggestion._id}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(suggestion.content);
            }}
            className={`
              px-4 py-3 cursor-pointer group hover:bg-accent
              ${isSelected ? 'bg-info/70 ring-inset ring-1 ring-info/20' : ''}
            `}
          >
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium truncate group-hover:text-info ${
                      isSelected ? 'text-info' : 'text-foreground'
                    }`}
                  >
                    {suggestion.name}
                  </span>
                  {suggestion.channelId && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                      {channelName || 'Channel'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {suggestion.preview}
                </div>
                {suggestion.updatedAt &&
                  !isNaN(new Date(suggestion.updatedAt).getTime()) && (
                    <div className="mt-1.5 text-xs text-muted-foreground">
                      Updated{' '}
                      {formatDistanceToNow(new Date(suggestion.updatedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  )}
              </div>
              <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs text-muted-foreground group-hover:bg-accent transition-colors">
                {index + 1}
              </div>
            </div>
          </div>
        );
      })}

      <div className="sticky bottom-0 bg-linear-to-t from-primary/10 to-background border-t border-border px-4 py-2">
        <div className="text-xs text-center text-muted-foreground">
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
            Enter
          </kbd>{' '}
          to select
        </div>
      </div>
    </Popover.Content>
  </Popover>
);
