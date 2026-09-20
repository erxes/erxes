import { Button, cn } from 'erxes-ui';
import {
  IconChevronDown,
  IconChevronUp,
  IconLock,
  IconMessage2,
} from '@tabler/icons-react';
import type { DragEventHandler, KeyboardEventHandler, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type ComposerShellProps = {
  children: ReactNode;
  collapsed: boolean;
  isInternalNote: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onDrop: DragEventHandler<HTMLDivElement>;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
};

export const ComposerShell = ({
  children,
  collapsed,
  isInternalNote,
  onCollapsedChange,
  onDrop,
  onKeyDown,
}: ComposerShellProps) => {
  const { t } = useTranslation('frontline');

  if (isInternalNote && collapsed) {
    return (
      <div className="px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3">
        <Button
          type="button"
          variant="outline"
          className="mx-auto flex h-11 w-full max-w-3xl justify-start rounded-xl border-warning/40 bg-warning/10 px-3 text-warning hover:bg-warning/20"
          onClick={() => onCollapsedChange(false)}
          aria-label="Expand internal note composer"
        >
          <IconLock className="size-4" />
          <span className="text-xs font-medium">
            {t('internal-note', 'Internal Note')}
          </span>
          <span className="hidden truncate text-xs font-normal text-muted-foreground sm:inline">
            {t('note-visibility', 'Only visible to your team')}
          </span>
          <IconChevronUp className="ml-auto size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3 sm:pt-3 sm:pb-3">
      <div
        onDropCapture={onDrop}
        onKeyDown={onKeyDown}
        onDragOverCapture={(event) => event.preventDefault()}
        className={cn(
          'mx-auto flex max-h-[min(70vh,40rem)] min-h-28 w-full max-w-3xl flex-col gap-1 rounded-2xl border border-border/70 bg-background/95 py-2 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-colors duration-150',
          isInternalNote && 'border-warning/50 bg-warning/20',
        )}
      >
        <output className="flex flex-none items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground">
          {isInternalNote ? (
            <IconLock className="size-3.5" />
          ) : (
            <IconMessage2 className="size-3.5" />
          )}
          {isInternalNote
            ? t('note-visibility', 'Internal note - only visible to your team')
            : t('reply-visibility', 'Reply - sent to the customer')}
          {isInternalNote && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto size-7 rounded-full"
              aria-label="Collapse internal note composer"
              onClick={() => onCollapsedChange(true)}
            >
              <IconChevronDown className="size-4" />
            </Button>
          )}
        </output>
        {children}
      </div>
    </div>
  );
};
