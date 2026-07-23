import { Organization } from '@/navigation/components/Organization';
import { usePluginDisplayName } from '@/navigation/hooks/usePluginDisplayName';
import type { NavigationGroupResult } from '@/navigation/hooks/usePluginsNavigationGroups';
import { useNavigationTabs } from '@/navigation/hooks/useNavigationTabs';
import { AppPath } from '@/types/paths/AppPath';
import { Button, Tooltip } from 'erxes-ui';
import { IconAdjustments } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavigationActivityRailProps {
  onOpenPlugin: (pluginId: string) => void;
  onPreviewEnd: () => void;
  onPreviewStart: (pluginId: string) => void;
}

interface NavigationActivityRailItemProps {
  group: NavigationGroupResult;
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
  onMouseLeave: () => void;
  onMouseEnter: () => void;
}

const NavigationActivityRailItem = ({
  group,
  isActive,
  isOpen,
  onClick,
  onMouseLeave,
  onMouseEnter,
}: NavigationActivityRailItemProps) => {
  const pluginName = usePluginDisplayName(group.name, group.i18n);
  const Icon = group.icon;

  if (!Icon) {
    return null;
  }

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          aria-current={isActive ? 'page' : undefined}
          aria-label={pluginName}
          className="relative h-9 w-10 p-0"
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          variant={isActive ? 'secondary' : 'ghost'}
        >
          {isActive && (
            <span className="absolute -left-1 top-2 h-5 w-0.5 rounded-full bg-primary" />
          )}
          <Icon className={isActive ? 'text-primary' : undefined} />
          {isOpen && !isActive && (
            <span className="absolute bottom-1 size-1 rounded-full bg-muted-foreground" />
          )}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="right">{pluginName}</Tooltip.Content>
    </Tooltip>
  );
};

export const NavigationActivityRail = ({
  onOpenPlugin,
  onPreviewEnd,
  onPreviewStart,
}: NavigationActivityRailProps) => {
  const { activePlugin, navigationGroups, tabIds } = useNavigationTabs();
  const { t } = useTranslation('common', { keyPrefix: 'navigation-shell' });

  return (
    <aside className="flex w-12 shrink-0 flex-col items-center gap-1 border-r bg-background py-2">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            aria-label={t('home')}
            asChild
            className="mb-2 size-7 rounded-md bg-primary p-0 text-primary-foreground hover:bg-primary/90"
            size="icon"
          >
            <Link to={AppPath.Index}>
              <span className="font-semibold">e</span>
            </Link>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">{t('home')}</Tooltip.Content>
      </Tooltip>

      {Object.entries(navigationGroups).map(([pluginId, group]) => (
        <NavigationActivityRailItem
          group={group}
          isActive={activePlugin === pluginId}
          isOpen={tabIds.includes(pluginId)}
          key={pluginId}
          onClick={() => onOpenPlugin(pluginId)}
          onMouseEnter={() => onPreviewStart(pluginId)}
          onMouseLeave={onPreviewEnd}
        />
      ))}

      <div className="flex-1" />
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            aria-label={t('settings')}
            asChild
            className="size-9 p-0"
            size="icon"
            variant="ghost"
          >
            <Link to={`/${AppPath.Settings}`}>
              <IconAdjustments />
            </Link>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">{t('settings')}</Tooltip.Content>
      </Tooltip>
      <Organization compact />
    </aside>
  );
};
