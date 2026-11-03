import { IconMessageCircle } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import {
  SIDE_PANEL_CHAT_PATH,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';

import { CoreTabTooltip } from '@/navigation/components/core-tab/CoreTabTooltip';
import { agentActivityState } from '../states/agentActivityState';

/** The top-bar action and shortcut share the side panel's URL route. */
export const AssistantButton = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const { path, openPath, close } = useSidePanel();
  const activity = useAtomValue(agentActivityState);
  const allowed = isLoaded && hasActionPermission('agentsChat');
  const open = path === SIDE_PANEL_CHAT_PATH;
  const unread = activity.unread > 0 || activity.phase === 'awaiting';
  const toggle = useCallback(() => {
    if (open) close();
    else openPath(SIDE_PANEL_CHAT_PATH);
  }, [open, close, openPath]);

  useHotkeys('mod+j', toggle, { enabled: allowed, enableOnFormTags: true }, [
    toggle,
  ]);

  if (!allowed) return null;

  return (
    <CoreTabTooltip label={t('assistant', 'Assistant')} shortcut="⌘J">
      <Button
        aria-label={
          unread
            ? t('assistant-unread', 'Assistant, new response')
            : t('assistant', 'Assistant')
        }
        aria-pressed={open}
        aria-keyshortcuts="Control+J Meta+J"
        className={cn(
          'relative size-7 shrink-0',
          open && 'bg-primary/10 text-primary hover:bg-primary/15',
        )}
        size="icon"
        type="button"
        variant="ghost"
        onClick={toggle}
      >
        <IconMessageCircle className="size-4" />
        {unread && !open && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-primary"
          />
        )}
      </Button>
    </CoreTabTooltip>
  );
};
