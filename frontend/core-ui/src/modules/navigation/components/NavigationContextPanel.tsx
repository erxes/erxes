import {
  NavigationPluginContextContent,
  NavigationPluginPanelContent,
} from '@/navigation/components/NavigationPlugins';
import { NavigationResizeHandle } from '@/navigation/components/NavigationResizeHandle';
import {
  CONTEXT_ENTER_KEYFRAMES,
  getSectionKey,
  useEnterAnimation,
} from '@/navigation/hooks/useEnterAnimation';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { useNavigationPlacement } from '@/navigation/hooks/useNavigationPlacement';
import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import {
  navigationContextOpenState,
  navigationContextWidthState,
  navigationResizingState,
} from '@/navigation/states/navigationPanelState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { SettingsContextNavigation } from '@/settings/components/SettingsContextNavigation';
import { AppPath } from '@/types/paths/AppPath';
import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { motion, useReducedMotion } from 'motion/react';
import { type ReactNode, type RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const COLLAPSED_WIDTH = 48;

const NavigationContextPanelFrame = ({
  bodyRef,
  children,
  title,
}: {
  bodyRef: RefObject<HTMLDivElement>;
  children: ReactNode;
  title?: string;
}) => {
  const asideRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useAtom(navigationContextWidthState);
  const [open, setOpen] = useAtom(navigationContextOpenState);
  const resizing = useAtomValue(navigationResizingState);
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const toggleLabel = open
    ? t('collapse-sidebar', 'Collapse sidebar')
    : t('expand-sidebar', 'Expand sidebar');

  return (
    <motion.aside
      ref={asideRef}
      aria-label={title}
      initial={false}
      animate={{ width: open ? (width ?? 'auto') : COLLAPSED_WIDTH }}
      transition={
        reduceMotion || resizing
          ? { duration: 0 }
          : { duration: 0.2, ease: 'linear' }
      }
      className={cn(
        'relative flex shrink-0 flex-col overflow-hidden border-r bg-sidebar has-[>[data-navigation-context]:empty]:hidden',
        !width && 'max-w-80',
      )}
    >
      <div className="flex h-13 shrink-0 items-center px-2">
        <div
          className={cn(
            'min-w-0 flex-1 overflow-hidden transition-opacity duration-200 ease-linear',
            !open && 'opacity-0',
          )}
        >
          <span className="block truncate px-2 text-sm font-medium">
            {title}
          </span>
        </div>
        <Button
          aria-expanded={open}
          aria-label={toggleLabel}
          className="size-8 shrink-0 rounded-md"
          size="icon"
          title={toggleLabel}
          variant="ghost"
          onClick={() => setOpen(!open)}
        >
          {open ? <IconChevronsLeft /> : <IconChevronsRight />}
        </Button>
      </div>
      <div
        ref={bodyRef}
        data-navigation-context
        className={cn(
          'styled-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-1 transition-[opacity,visibility] duration-200 ease-linear [&>[data-sidebar=separator]:first-child]:hidden',
          !width && 'min-w-56',
          !open && 'invisible opacity-0',
        )}
        style={width ? { minWidth: width } : undefined}
      >
        {children}
      </div>
      {open && (
        <NavigationResizeHandle
          label={t('resize-sidebar', 'Resize sidebar')}
          panelRef={asideRef}
          min={180}
          max={480}
          onResize={setWidth}
          onReset={() => setWidth(null)}
        />
      )}
    </motion.aside>
  );
};

export const NavigationContextPanel = () => {
  const activities = useNavigationActivities();
  const navigationGroups = usePluginsNavigationGroups();
  const getPlacement = useNavigationPlacement();
  const { pathname } = useLocation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const activity = findNavigationActivityByPath(activities, pathname);
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const pluginActivity =
    !isSettings && activity?.kind === 'plugin' ? activity : undefined;
  const navigationGroup = pluginActivity
    ? navigationGroups[pluginActivity.id]
    : undefined;
  const showModules = Boolean(
    pluginActivity &&
    navigationGroup?.contents.length &&
    getPlacement(pluginActivity.id) === 'context',
  );
  const showSubGroups = Boolean(navigationGroup?.subGroups.length);

  useEnterAnimation(bodyRef, getSectionKey(pathname), CONTEXT_ENTER_KEYFRAMES);

  if (!isSettings && !showModules && !showSubGroups) {
    return null;
  }

  return (
    <NavigationContextPanelFrame
      bodyRef={bodyRef}
      title={isSettings ? t('settings', 'Settings') : pluginActivity?.label}
    >
      {isSettings && <SettingsContextNavigation />}
      {pluginActivity && showModules && (
        <NavigationPluginPanelContent activityId={pluginActivity.id} />
      )}
      {pluginActivity && showSubGroups && (
        <NavigationPluginContextContent activityId={pluginActivity.id} />
      )}
    </NavigationContextPanelFrame>
  );
};
