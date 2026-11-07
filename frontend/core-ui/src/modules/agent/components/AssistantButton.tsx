import { IconMessageCircle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { coreTabIconClassName } from '@/navigation/utils/coreTabClassName';

import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import { useGlobalSidebar } from '@/global-sidebar/hooks/useGlobalSidebar';

import { CoreTabTooltip } from '@/navigation/components/core-tab/CoreTabTooltip';
import { agentActivityState } from '../states/agentActivityState';

/** The top-bar action and shortcut toggle Assistant in the global sidebar. */
export const AssistantButton = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const { tool, toggleTool } = useGlobalSidebar();
  const activity = useAtomValue(agentActivityState);
  const allowed = isLoaded && hasActionPermission('agentsChat');
  const open = tool === 'assistant';
  const unread = activity.unread > 0 || activity.phase === 'awaiting';
  const toggle = useCallback(() => toggleTool('assistant'), [toggleTool]);

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
        className={coreTabIconClassName(open)}
        size="icon"
        type="button"
        variant="ghost"
        onClick={toggle}
      >
        <IconMessageCircle className="size-4" />
        {unread && !open && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-primary dark:group-data-[framed=true]/layout:bg-primary-foreground"
          />
        )}
      </Button>
    </CoreTabTooltip>
  );
};
