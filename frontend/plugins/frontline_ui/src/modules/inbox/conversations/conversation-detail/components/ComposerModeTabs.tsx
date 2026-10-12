import { IconLock, IconMessage2 } from '@tabler/icons-react';
import { Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type ComposerModeTabsProps = {
  isInternalNote: boolean;
  disabled: boolean;
  replyDisabled?: boolean;
  onInternalNoteChange: (internal: boolean) => void;
};

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
        className="grid h-8 w-full max-w-xs grid-cols-2 gap-0 rounded-lg bg-muted/70 p-0.5"
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
            'data-[state=active]:bg-black/5 data-[state=active]:text-[#272727] ' +
            'data-[state=active]:shadow-none data-[state=active]:hover:bg-black/5 ' +
            'dark:data-[state=active]:bg-[#E8D99B]/10 dark:data-[state=active]:text-[#E8D99B] ' +
            'dark:data-[state=active]:hover:bg-[#E8D99B]/10'
          }
        >
          <IconLock className="size-3.5" />
          {t('internal-note', 'Internal Note')}
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
};
