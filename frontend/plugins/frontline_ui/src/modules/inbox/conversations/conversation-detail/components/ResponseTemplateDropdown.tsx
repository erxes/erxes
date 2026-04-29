import { formatDistanceToNow } from 'date-fns';
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

const TemplateItem = ({
  suggestion,
  index,
  isSelected,
  channelName,
  onSelect,
}: {
  suggestion: TemplateSuggestion;
  index: number;
  isSelected: boolean;
  channelName?: string;
  onSelect: (content: string, templateId?: string) => void;
}) => (
  <div
    key={suggestion._id}
    role="option"
    tabIndex={0}
    aria-selected={isSelected}
    onClick={() => onSelect(suggestion.content)}
    onKeyDown={(e) => e.key === 'Enter' && onSelect(suggestion.content)}
    className={`
      px-4 py-3 cursor-pointer
      transition-all duration-150
      hover:bg-primary/10
      ${isSelected ? 'bg-info/70 ring-1 ring-info/20' : ''}
      group
    `}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div
            className={`
              font-medium truncate
              ${isSelected ? 'text-info' : 'text-foreground'}
              group-hover:text-info
            `}
          >
            {suggestion.name}
          </div>
          {suggestion.channelId && (
            <span
              className="
              inline-flex items-center px-2 py-0.5 rounded-full
              text-xs font-medium bg-accent
              text-accent-foreground
            "
            >
              {channelName || 'Channel'}
            </span>
          )}
        </div>

        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {suggestion.preview}
        </div>
      </div>

      <div
        className="
        shrink-0 flex items-center justify-center
        w-6 h-6 rounded-full
        bg-muted
        text-xs text-muted-foreground
        group-hover:bg-accent
        transition-colors
      "
      >
        {index + 1}
      </div>
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
);

export const ResponseTemplateDropdown = ({
  suggestions,
  selectedIndex,
  availableChannels = [],
  onSelect,
}: ResponseTemplateDropdownProps) => (
  <div
    className="
      absolute left-0 right-0
      md:left-6 md:right-6
      top-[72px]
      z-50
      bg-background/95
      border border-border
      rounded-lg shadow-lg
      max-h-80 overflow-y-auto
      backdrop-blur-sm
      transform transition-all duration-200
      mx-2 md:mx-0
    "
  >
    <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-10 border-b border-border px-4 py-2">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Response Templates
      </div>
    </div>

    <div className="divide-y divide-border">
      {suggestions.map((suggestion, index) => (
        <TemplateItem
          key={suggestion._id}
          suggestion={suggestion}
          index={index}
          isSelected={index === selectedIndex}
          channelName={
            availableChannels.find((c) => c._id === suggestion.channelId)?.name
          }
          onSelect={onSelect}
        />
      ))}
    </div>

    <div className="sticky bottom-0 bg-linear-to-t from-primary/10 to-background border-t border-border px-4 py-2">
      <div className="text-xs text-center text-muted-foreground">
        Press{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
          Enter
        </kbd>{' '}
        to select
      </div>
    </div>
  </div>
);
