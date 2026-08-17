import { navigationPanelOpenState } from '@/navigation/states/navigationPanelState';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { AppPath } from '@/types/paths/AppPath';
import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { Button, cn, Separator, Sidebar } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const getNavigationPanelClassName = (panelOpen: boolean, isMobile: boolean) => {
  const baseClassName =
    'peer relative z-20 flex shrink-0 flex-col bg-sidebar transition-[width] duration-200 ease-out motion-reduce:transition-none';

  if (isMobile) {
    return cn(
      baseClassName,
      'h-full overflow-hidden border-r',
      panelOpen ? 'w-[calc(100%-3rem)]' : 'w-10',
    );
  }

  return cn(baseClassName, panelOpen ? 'h-full w-64 border-r' : 'h-full w-0');
};

export const NavigationPanel = () => {
  const [panelOpen, setPanelOpen] = useAtom(navigationPanelOpenState);
  const { pathname } = useLocation();
  const { isMobile } = Sidebar.useSidebar();
  const { t: navigationT } = useTranslation('common', {
    keyPrefix: 'navigation',
  });
  const { t: organizationT } = useTranslation('organization');
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const expanded = isMobile || panelOpen;
  const title = organizationT('settings');
  const toggleLabel = navigationT('toggle-panel');

  if (!isSettings) {
    return null;
  }

  return (
    <aside
      data-state={expanded ? 'expanded' : 'collapsed'}
      className={getNavigationPanelClassName(expanded, isMobile)}
    >
      <header
        className={cn(
          'relative flex h-13 w-full min-w-10 shrink-0 items-center overflow-hidden pt-1',
          expanded ? 'gap-2 px-2' : 'gap-0 px-1',
        )}
      >
        <span
          aria-hidden={!expanded}
          className={cn(
            'min-w-0 flex-1 truncate text-[13px] font-semibold transition-opacity duration-100 motion-reduce:delay-0 motion-reduce:transition-none',
            expanded
              ? 'visible delay-100 px-1 opacity-100'
              : 'invisible delay-0 px-0 opacity-0',
          )}
        >
          {title}
        </span>
        {!isMobile && (
          <Button
            aria-label={toggleLabel}
            className="size-8 shrink-0"
            onClick={() => setPanelOpen((open) => !open)}
            size="icon"
            title={toggleLabel}
            variant="ghost"
          >
            {expanded ? <IconChevronsLeft /> : <IconChevronsRight />}
          </Button>
        )}
        {!expanded && !isMobile && (
          <Separator.Inline className="absolute top-1/2 right-0 -translate-y-1/2" />
        )}
      </header>
      <div
        aria-hidden={!expanded}
        className={cn(
          'min-h-0 w-full flex-1 overflow-hidden transition-opacity duration-100 motion-reduce:delay-0 motion-reduce:transition-none',
          expanded
            ? 'visible delay-100 opacity-100'
            : 'invisible delay-0 opacity-0',
        )}
      >
        <div className={cn('flex h-full flex-col', !isMobile && 'w-64')}>
          <SettingsSidebar hideExit />
        </div>
      </div>
    </aside>
  );
};
