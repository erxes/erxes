import type { ComposerShellProps } from '@/inbox/conversations/conversation-detail/types/composerUi';
import { INTERNAL_NOTE_BACKGROUND } from '@/inbox/constants/internalNoteStyles';
import { Button, cn } from 'erxes-ui';
import { IconChevronUp, IconLock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ComposerShellHeader } from './ComposerShellHeader';
import { useComposerShell } from '../../hooks/composer/useComposerShell';

export const ComposerShell = ({
  children,
  replyPreview,
  disabled,
  onDrop,
  onInternalNoteChange,
}: ComposerShellProps) => {
  const { t } = useTranslation('frontline');
  const { collapsed, setCollapsed, isInternalNote, onlyInternal, noteOnly } =
    useComposerShell();

  if (isInternalNote && collapsed) {
    return (
      <div className="flex h-full items-end px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3">
        <Button
          type="button"
          variant="outline"
          className={cn(
            'mx-auto flex h-11 w-full max-w-3xl justify-start rounded-xl border-border px-3',
            INTERNAL_NOTE_BACKGROUND,
          )}
          onClick={() => setCollapsed(false)}
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
        data-composer-form
        onSubmit={(event) => event.preventDefault()}
        onDropCapture={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest('[role="dialog"]')
          ) {
            event.preventDefault();
            return;
          }
          onDrop(event);
        }}
        onDragOverCapture={(event) => event.preventDefault()}
        className={cn(
          'mx-auto flex h-full min-h-0 min-w-0 w-full max-w-3xl flex-col gap-1 rounded-2xl border border-border/70 bg-background/95 pb-2 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-colors duration-150',
          isInternalNote && ['border-border', INTERNAL_NOTE_BACKGROUND],
        )}
      >
        <ComposerShellHeader
          noteOnly={noteOnly}
          isInternalNote={isInternalNote}
          onlyInternal={onlyInternal}
          disabled={disabled}
          onInternalNoteChange={onInternalNoteChange}
          replyPreview={replyPreview}
          onCollapse={() => setCollapsed(true)}
        />
        {children}
      </form>
    </div>
  );
};
