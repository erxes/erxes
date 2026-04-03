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
  onSelect: (content: string) => void;
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
  onSelect: (content: string) => void;
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
      hover:bg-gray-50 dark:hover:bg-gray-800/70
      ${
        isSelected
          ? 'bg-blue-50/70 dark:bg-blue-900/20 ring-1 ring-blue-500/20'
          : ''
      }
      group
    `}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div
            className={`
              font-medium truncate
              ${
                isSelected
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-gray-100'
              }
              group-hover:text-blue-500 dark:group-hover:text-blue-400
            `}
          >
            {suggestion.name}
          </div>
          {suggestion.channelId && (
            <span
              className="
              inline-flex items-center px-2 py-0.5 rounded-full
              text-xs font-medium bg-gray-100 dark:bg-gray-700
              text-gray-600 dark:text-gray-300
            "
            >
              {channelName || 'Channel'}
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
          {suggestion.preview}
        </div>
      </div>

      <div
        className="
        flex-shrink-0 flex items-center justify-center
        w-6 h-6 rounded-full
        bg-gray-100 dark:bg-gray-800
        text-xs text-gray-500 dark:text-gray-400
        group-hover:bg-gray-200 dark:group-hover:bg-gray-700
        transition-colors
      "
      >
        {index + 1}
      </div>
    </div>

    {suggestion.updatedAt &&
      !isNaN(new Date(suggestion.updatedAt).getTime()) && (
        <div className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
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
      bg-white/95 dark:bg-gray-900/95
      border border-gray-200 dark:border-gray-700
      rounded-lg shadow-lg
      max-h-[320px] overflow-y-auto
      backdrop-blur-sm
      transform transition-all duration-200
      mx-2 md:mx-0
    "
  >
    <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 border-b border-gray-100 dark:border-gray-800 px-4 py-2">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Response Templates
      </div>
    </div>

    <div className="divide-y divide-gray-100 dark:divide-gray-800">
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

    <div className="sticky bottom-0 bg-gradient-to-t from-white to-white/70 dark:from-gray-900 dark:to-gray-900/70 border-t border-gray-100 dark:border-gray-800 px-4 py-2">
      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
        Press{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
          Enter
        </kbd>{' '}
        to select
      </div>
    </div>
  </div>
);
