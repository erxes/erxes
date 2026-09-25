import { formatDistanceToNow } from 'date-fns';
import { Popover, Spinner } from 'erxes-ui';
import type { IChannel } from '@/channels/types';
import { useTranslation } from 'react-i18next';

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
  loading?: boolean;
}

const TemplateSuggestionDetails = ({
  suggestion,
  isSelected,
  channelName,
}: {
  suggestion: TemplateSuggestion;
  isSelected: boolean;
  channelName?: string;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span
          className={`truncate font-medium group-hover:text-info ${
            isSelected ? 'text-info' : 'text-foreground'
          }`}
        >
          {suggestion.name}
        </span>
        {suggestion.channelId && (
          <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            {channelName || t('channel-label', 'Channel')}
          </span>
        )}
      </div>
      <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {suggestion.preview}
      </div>
      {suggestion.updatedAt &&
        !isNaN(new Date(suggestion.updatedAt).getTime()) && (
          <div className="mt-1.5 text-xs text-muted-foreground">
            {t('updated', 'Updated')}{' '}
            {formatDistanceToNow(new Date(suggestion.updatedAt), {
              addSuffix: true,
            })}
          </div>
        )}
    </div>
  );
};

const TemplateSuggestionItem = ({
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
}) => {
  return (
    <div
      onMouseDown={(event) => {
        event.preventDefault();
        onSelect(suggestion.content, suggestion._id);
      }}
      className={`group cursor-pointer px-4 py-3 hover:bg-accent ${
        isSelected ? 'bg-info/70 ring-1 ring-inset ring-info/20' : ''
      }`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <TemplateSuggestionDetails
          suggestion={suggestion}
          isSelected={isSelected}
          channelName={channelName}
        />
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground transition-colors group-hover:bg-accent">
          {index + 1}
        </div>
      </div>
    </div>
  );
};

export const ResponseTemplateDropdown = ({
  suggestions,
  selectedIndex,
  availableChannels = [],
  onSelect,
  loading = false,
}: ResponseTemplateDropdownProps) => {
  const { t } = useTranslation('frontline');
  return (
    <Popover open>
      <Popover.Anchor asChild>
        <span className="sr-only" />
      </Popover.Anchor>
      <Popover.Content
        sideOffset={20}
        side="top"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 min-w-lg overflow-hidden"
      >
        <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-10 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t('response-templates', 'Response templates')}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
            <Spinner size="sm" />
            {t('loading-templates', 'Loading templates...')}
          </div>
        )}

        {!loading && suggestions.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t('no-matching-templates', 'No matching templates')}
          </div>
        )}

        {!loading &&
          suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            const channelName = availableChannels.find(
              (c) => c._id === suggestion.channelId,
            )?.name;

            return (
              <TemplateSuggestionItem
                key={suggestion._id}
                suggestion={suggestion}
                index={index}
                isSelected={isSelected}
                channelName={channelName}
                onSelect={onSelect}
              />
            );
          })}

        {!loading && suggestions.length > 0 && (
          <div className="sticky bottom-0 bg-linear-to-t from-primary/10 to-background border-t border-border px-4 py-2">
            <div className="text-xs text-center text-muted-foreground">
              {t('press', 'Press')}{' '}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                {t('enter-key', 'Enter')}
              </kbd>{' '}
              {t('to-select', 'to select')}
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};
