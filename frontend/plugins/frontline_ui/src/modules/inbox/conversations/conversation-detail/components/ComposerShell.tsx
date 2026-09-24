import { Button, Tabs, cn } from 'erxes-ui';
import {
  IconChevronDown,
  IconChevronUp,
  IconLock,
  IconMessage2,
} from '@tabler/icons-react';
import type { DragEventHandler, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type ComposerShellProps = {
  children: ReactNode;
  collapsed: boolean;
  disabled: boolean;
  isInternalNote: boolean;
  onlyInternal: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onDrop: DragEventHandler<HTMLFormElement>;
  onInternalNoteChange: (internal: boolean) => void;
};

export const ComposerShell = ({
  children,
  collapsed,
  disabled,
  isInternalNote,
  onlyInternal,
  onCollapsedChange,
  onDrop,
  onInternalNoteChange,
}: ComposerShellProps) => {
  const { t } = useTranslation('frontline');

  if (isInternalNote && collapsed) {
    return (
      <div className="flex h-full items-end px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3">
        <Button
          type="button"
          variant="outline"
          className="mx-auto flex h-11 w-full max-w-3xl justify-start rounded-xl border-warning/40 bg-warning/10 px-3 text-warning hover:bg-warning/20"
          onClick={() => onCollapsedChange(false)}
          aria-label={t(
            'expand-internal-note-composer',
            'Expand internal note composer',
          )}
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
    <div className="flex h-full min-h-0 flex-col justify-end px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3 sm:pt-3 sm:pb-3">
      <form
        onSubmit={(event) => event.preventDefault()}
        onDropCapture={onDrop}
        onDragOverCapture={(event) => event.preventDefault()}
        className={cn(
          'mx-auto flex h-full min-h-0 min-w-0 w-full max-w-3xl flex-col gap-1 rounded-2xl border border-border/70 bg-background/95 pb-2 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-colors duration-150',
          isInternalNote && 'border-warning/50 bg-warning/20',
        )}
      >
        <div className="flex flex-none items-center gap-3 border-b border-border/50 px-3 py-2">
          <Tabs
            value={isInternalNote ? 'internal' : 'reply'}
            onValueChange={(value) =>
              onInternalNoteChange(value === 'internal')
            }
            className="min-w-0 flex-1"
          >
            <Tabs.List
              variant="segment"
              className="grid h-8 w-full max-w-xs grid-cols-2 gap-0 rounded-lg bg-muted/70 p-0.5"
            >
              <Tabs.Trigger
                value="reply"
                disabled={disabled || onlyInternal}
                className="h-7 gap-1.5 rounded-md px-3 py-1 text-xs shadow-none"
              >
                <IconMessage2 className="size-3.5" />
                {t('reply', 'Reply')}
              </Tabs.Trigger>
              <Tabs.Trigger
                value="internal"
                disabled={disabled}
                className="h-7 gap-1.5 rounded-md px-3 py-1 text-xs shadow-none data-[state=active]:bg-warning/15 data-[state=active]:text-warning data-[state=active]:shadow-none data-[state=active]:hover:bg-warning/15"
              >
                <IconLock className="size-3.5" />
                {t('internal-note', 'Internal Note')}
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
          {isInternalNote && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto size-7 shrink-0 rounded-full"
              aria-label={t(
                'collapse-internal-note-composer',
                'Collapse internal note composer',
              )}
              onClick={() => onCollapsedChange(true)}
            >
              <IconChevronDown className="size-4" />
            </Button>
          )}
        </div>
        {children}
      </form>
    </div>
  );
};
