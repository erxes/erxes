import type { ComposerModeTabsProps } from '@/inbox/conversations/conversation-detail/types/composerUi';
import { IconLock, IconMessage2 } from '@tabler/icons-react';
import { Tabs, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ComposerModeTabs = ({
  isInternalNote,
  disabled,
  replyDisabled = false,
  onInternalNoteChange,
}: ComposerModeTabsProps) => {
  const { t } = useTranslation('frontline');

  return (
    <Tabs
      value={isInternalNote ? 'internal' : 'reply'}
      onValueChange={(value) => onInternalNoteChange(value === 'internal')}
      className="min-w-0 flex-1"
    >
      <Tabs.List
        variant="segment"
        className={cn(
          'grid h-8 w-full max-w-xs grid-cols-2 gap-0 rounded-lg p-0.5',
          isInternalNote
            ? 'bg-[#E8D99B]/25 dark:bg-[#E8D99B]/5'
            : 'bg-muted/70',
        )}
      >
        <Tabs.Trigger
          value="reply"
          disabled={disabled || replyDisabled}
          className="h-7 gap-1.5 rounded-md px-3 py-1 text-xs shadow-none"
        >
          <IconMessage2 className="size-3.5" />
          {t('reply', 'Reply')}
        </Tabs.Trigger>
        <Tabs.Trigger
          value="internal"
          disabled={disabled}
          className={
            'h-7 gap-1.5 rounded-md px-3 py-1 text-xs shadow-none ' +
            'data-[state=active]:bg-white data-[state=active]:text-[#272727] ' +
            'data-[state=active]:shadow-sm data-[state=active]:hover:bg-[#FFF8E6] ' +
            'dark:data-[state=active]:bg-[#E8D99B]/20 dark:data-[state=active]:text-[#E8D99B] ' +
            'dark:data-[state=active]:hover:bg-[#E8D99B]/20'
          }
        >
          <IconLock className="size-3.5" />
          {t('internal-note', 'Internal Note')}
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
};
