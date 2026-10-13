import { IconArrowLeft, IconSearch, IconX } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { TKbTopic } from '../types/knowledgeBaseTypes';
import { postToHost } from '../utils/knowledgeBaseUtils';

const HEADER_BUTTON_CLASS =
  'flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/15';

export const KbHeader = ({
  topic,
  heading,
  canGoBack,
  isFloating,
  term,
  onBack,
  onTermChange,
}: {
  topic?: TKbTopic;
  heading: string;
  canGoBack: boolean;
  isFloating: boolean;
  term: string;
  onBack: () => void;
  onTermChange: (term: string) => void;
}) => (
  <header
    className="shrink-0 px-4 pb-4 pt-3 text-primary-foreground"
    style={{ backgroundColor: topic?.color || 'var(--primary)' }}
  >
    <div className="flex min-h-8 items-center gap-2">
      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className={cn('-ml-1', HEADER_BUTTON_CLASS)}
        >
          <IconArrowLeft size={18} />
        </button>
      )}
      <span className="min-w-0 flex-1 truncate text-base font-semibold">
        {heading}
      </span>
      {isFloating && (
        <button
          type="button"
          onClick={() => postToHost({ type: 'close' })}
          aria-label="Close"
          className={cn('-mr-1', HEADER_BUTTON_CLASS)}
        >
          <IconX size={18} />
        </button>
      )}
    </div>

    {!canGoBack && topic?.description && (
      <p className="mt-1 line-clamp-2 text-xs text-primary-foreground/80">
        {topic.description}
      </p>
    )}

    {!canGoBack && (
      <label className="mt-3 flex items-center gap-2 rounded-xl bg-background px-3 py-2.5 text-foreground">
        <IconSearch size={16} className="shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          placeholder="Search for help"
          aria-label="Search articles"
          className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </label>
    )}
  </header>
);
