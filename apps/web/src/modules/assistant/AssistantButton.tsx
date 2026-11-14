import { IconSparkles } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { CoreTabTooltip } from '~/modules/navigation/CoreTabTooltip';
import { assistantOpenState, assistantUnreadState } from './assistantState';

const useToggleShortcut = (toggle: () => void) =>
  useHotkeys(['meta+j', 'ctrl+j'], toggle, {
    preventDefault: true,
    enableOnFormTags: true,
    enableOnContentEditable: true,
  });

const AssistantToggle = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const [open, setOpen] = useAtom(assistantOpenState);
  const [unread, setUnread] = useAtom(assistantUnreadState);

  const toggle = () => {
    setOpen((current) => !current);
    setUnread(false);
  };

  useToggleShortcut(toggle);

  return (
    <CoreTabTooltip label={t('assistant-shortcut', 'Assistant (Ctrl+J)')}>
      <Button
        type="button"
        size="icon"
        variant="nav"
        aria-label={t('assistant', 'Assistant')}
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-description={unread ? t('assistant-unread', 'New reply') : undefined}
        className="relative shrink-0"
        onClick={toggle}
      >
        <IconSparkles className="size-4" />
        {unread && <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />}
      </Button>
    </CoreTabTooltip>
  );
};

export const AssistantButton = () => {
  const can = useCan();
  const setOpen = useSetAtom(assistantOpenState);
  const allowed = can('assistant.chat');

  useEffect(() => {
    if (!allowed) setOpen(false);
  }, [allowed, setOpen]);

  return allowed ? <AssistantToggle /> : null;
};
