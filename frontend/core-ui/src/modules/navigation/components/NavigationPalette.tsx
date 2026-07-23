import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { visitedPageTabsState } from '@/navigation/states/visitedPageTabsState';
import { doesNavigationActivityMatchPath } from '@/navigation/utils/navigationActivities';
import { IconApps } from '@tabler/icons-react';
import { activePluginState, Command } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const NavigationPalette = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const activities = useNavigationActivities();
  const tabs = useAtomValue(visitedPageTabsState);
  const activeActivityId = useAtomValue(activePluginState);
  const setActiveActivityId = useSetAtom(activePluginState);
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  const openActivity = (activityId: string, path: string) => {
    setActiveActivityId(activityId);
    navigate(`/${path.replace(/^\/+/, '')}`);
    onOpenChange(false);
  };

  return (
    <Command.Dialog
      dialogContentClassName="max-w-md"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Command.Input
        focusOnMount
        placeholder={t('open-plugin')}
        variant="primary"
      />
      <Command.List className="styled-scroll">
        <Command.Empty>{t('no-plugins-match')}</Command.Empty>
        <Command.Group>
          {activities.map((activity) => {
            const Icon = activity.icon || IconApps;
            const firstTabIndex = tabs.findIndex((tab) =>
              doesNavigationActivityMatchPath(activity, tab.pathname),
            );

            return (
              <Command.Item
                key={activity.id}
                value={activity.label}
                onSelect={() => openActivity(activity.id, activity.defaultPath)}
              >
                <Icon />
                <span>{activity.label}</span>
                <Command.Shortcut>
                  {activity.id === activeActivityId
                    ? t('active')
                    : firstTabIndex >= 0
                    ? `⌘${firstTabIndex + 1}`
                    : t('open')}
                </Command.Shortcut>
              </Command.Item>
            );
          })}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};
