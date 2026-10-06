import { Sidebar, cn } from 'erxes-ui';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationActivityGroups } from '@/navigation/components/navigation-activity-rail/NavigationActivityGroups';
import { NavigationActivityMore } from '@/navigation/components/NavigationActivityMore';
import { NavigationActivitySearchButton } from '@/navigation/components/navigation-activity-rail/NavigationActivitySearchButton';
import { NavigationFavoritesSection } from '@/navigation/components/navigation-activity-rail/NavigationFavoritesSection';
import { NavigationInboxButton } from '@/navigation/components/navigation-activity-rail/NavigationInboxButton';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationResizeHandle } from '@/navigation/components/NavigationResizeHandle';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { NavigationWelcomeButton } from '@/navigation/components/navigation-activity-rail/NavigationWelcomeButton';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { navigationSidebarWidthState } from '@/navigation/states/navigationPanelState';
import { splitPromotedNavigationActivities } from '@/navigation/utils/promotedNavigationActivities';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

type TNavigationActivityRailProps = Readonly<{
  activities: INavigationActivity[];
  activeActivityId: string | null;
  expandedActivityIds: string[];
  hiddenActivities: INavigationActivity[];
  isInboxActive: boolean;
  isWelcomeActive: boolean;
  isActivityPinned: (activityId: string) => boolean;
  isSettings: boolean;
  onActivityPinnedChange: (activityId: string, pinned: boolean) => void;
  onSearch: () => void;
  onSelectInbox: () => void;
  onSelectWelcome: () => void;
  onSelectActivity: (activity: INavigationActivity) => void;
  onToggleActivity: (activity: INavigationActivity) => void;
  visibleActivities: INavigationActivity[];
}>;

const NavigationActivityRailMain = ({
  activities,
  activeActivityId,
  expanded,
  expandedActivityIds,
  hiddenActivities,
  hoverEnabled,
  isInboxActive,
  isWelcomeActive,
  isActivityPinned,
  isSettings,
  onActivityPinnedChange,
  onSearch,
  onSelectInbox,
  onSelectWelcome,
  onSelectActivity,
  onToggleActivity,
  visibleActivities,
}: TNavigationActivityRailProps &
  Readonly<{ expanded: boolean; hoverEnabled: boolean }>) => {
  const { promoted } = splitPromotedNavigationActivities(activities);
  const visibleRest = splitPromotedNavigationActivities(visibleActivities).rest;
  const hiddenRest = splitPromotedNavigationActivities(hiddenActivities).rest;
  const usePromotedRail = promoted.length > 0;

  return (
    <>
      <NavigationWelcomeButton
        expanded={expanded}
        isWelcomeActive={isWelcomeActive}
        onSelectWelcome={onSelectWelcome}
      />
      <div className="mb-1 flex shrink-0 flex-col gap-1">
        <NavigationInboxButton
          expanded={expanded}
          isInboxActive={isInboxActive}
          onSelectInbox={onSelectInbox}
        />
        <NavigationActivitySearchButton
          expanded={expanded}
          onSearch={onSearch}
        />
        {usePromotedRail &&
          promoted.map((activity) => (
            <NavigationActivityButton
              key={activity.id}
              activity={activity}
              active={!isSettings && activity.id === activeActivityId}
              expanded={expanded}
              onSelect={() => onSelectActivity(activity)}
            />
          ))}
      </div>
      <div
        className={cn(
          'flex flex-col items-stretch',
          expanded ? 'gap-2' : 'gap-1',
        )}
      >
        <NavigationFavoritesSection expanded={expanded} />
        <NavigationActivityGroups
          activeActivityId={activeActivityId}
          activities={usePromotedRail ? visibleRest : visibleActivities}
          expanded={expanded}
          expandedActivityIds={expandedActivityIds}
          hoverEnabled={hoverEnabled}
          isActivityPinned={isActivityPinned}
          isSettings={isSettings}
          onActivityPinnedChange={onActivityPinnedChange}
          onSelectActivity={onSelectActivity}
          onToggleActivity={onToggleActivity}
        />
        <NavigationActivityMore
          activities={usePromotedRail ? hiddenRest : hiddenActivities}
          expanded={expanded}
          isActivityPinned={isActivityPinned}
          onPinnedChange={onActivityPinnedChange}
          onSelect={onSelectActivity}
        />
      </div>
    </>
  );
};

export const NavigationActivityRail = (props: TNavigationActivityRailProps) => {
  const { isSettings } = props;
  const { isMobile, state } = Sidebar.useSidebar();
  const expanded = isMobile || state === 'expanded';
  const hoverEnabled = !expanded && !isMobile;
  const reduceMotion = useReducedMotion();
  const showSettings = isSettings && expanded;
  const setSidebarWidth = useSetAtom(navigationSidebarWidthState);
  const asideRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <aside
      ref={asideRef}
      className={cn(
        'relative flex h-full w-full min-w-0 shrink-0 flex-col overflow-hidden border-none bg-sidebar px-2 py-2',
        !expanded && 'border-r!',
      )}
    >
      <NavigationRailLogo expanded={expanded} />
      <div
        className={cn(
          'min-h-0 flex-1 overflow-x-hidden overflow-y-auto',
          !expanded && 'hide-scroll',
        )}
      >
        <div className="flex min-h-full flex-col">
          <motion.div
            key={showSettings ? 'settings' : 'main'}
            animate={{ opacity: 1, x: 0 }}
            className={cn('flex flex-1 flex-col', showSettings && '-mx-2')}
            initial={
              isFirstRender.current
                ? false
                : { opacity: 0, x: showSettings ? 24 : -24 }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    x: { duration: 0.26, ease: NAVIGATION_EASE },
                    opacity: { duration: 0.18, ease: 'easeOut' },
                  }
            }
          >
            {showSettings ? (
              <SettingsSidebar />
            ) : (
              <NavigationActivityRailMain
                {...props}
                expanded={expanded}
                hoverEnabled={hoverEnabled}
              />
            )}
          </motion.div>
          <NavigationSidebarFooter
            expanded={expanded}
            isSettings={isSettings}
          />
        </div>
      </div>
      {expanded && !isMobile && (
        <NavigationResizeHandle
          label={t('resize-sidebar', 'Resize sidebar')}
          panelRef={asideRef}
          min={192}
          max={384}
          onResize={setSidebarWidth}
          onReset={() => setSidebarWidth(null)}
        />
      )}
    </aside>
  );
};
