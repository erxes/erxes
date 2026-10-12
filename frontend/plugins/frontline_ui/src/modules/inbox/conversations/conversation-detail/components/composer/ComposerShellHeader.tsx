import type { ComposerShellHeaderProps } from '@/inbox/conversations/conversation-detail/types/composerUi';
import { INTERNAL_NOTE_ICON } from '@/inbox/constants/internalNoteStyles';
import { Button, cn } from 'erxes-ui';
import { IconChevronDown, IconLock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ComposerModeTabs } from '@/inbox/conversations/conversation-detail/components/ComposerModeTabs';

export const ComposerShellHeader = ({
  noteOnly,
  isInternalNote,
  onlyInternal,
  disabled,
  onInternalNoteChange,
  replyPreview,
  onCollapse,
}: ComposerShellHeaderProps) => {
  const { t } = useTranslation('frontline');
  return (
    <div
      data-composer-header
      className="flex flex-none flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/50 px-3 py-2"
    >
      {noteOnly ? (
        <div
          className={cn(
            'flex h-8 min-w-0 flex-1 items-center gap-1.5 text-xs font-medium',
            INTERNAL_NOTE_ICON,
          )}
        >
          <IconLock className="size-3.5" />
          {t('internal-note', 'Internal Note')}
        </div>
      ) : (
        <div className="w-full min-w-0 shrink-0 sm:w-80">
          <ComposerModeTabs
            isInternalNote={isInternalNote}
            disabled={disabled}
            replyDisabled={onlyInternal}
            onInternalNoteChange={onInternalNoteChange}
          />
        </div>
      )}
      {replyPreview && (
        <div className="min-w-0 flex-1 basis-48">{replyPreview}</div>
      )}
      {isInternalNote && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'ml-auto size-7 shrink-0 rounded-full',
            INTERNAL_NOTE_ICON,
          )}
          aria-label={t(
            'collapse-internal-note-composer',
            'Collapse internal note composer',
          )}
          onClick={onCollapse}
        >
          <IconChevronDown className="size-4" />
        </Button>
      )}
    </div>
  );
};
