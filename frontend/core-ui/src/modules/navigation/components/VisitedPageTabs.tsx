import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import {
  getVisitedPageTabIcon,
  getVisitedPageTabLabel,
} from '@/navigation/utils/visitedPageTabs';
import { IconFile, IconX } from '@tabler/icons-react';
import { Button, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const VisitedPageTabs = () => {
  const { t } = useTranslation('common');
  const modules = usePluginsModules();
  const { activePathname, closeVisitedPageTab, openVisitedPageTab, tabs } =
    useVisitedPageTabs();
  const labels = {
    details: t('navigation.details'),
    myInbox: t('my-inbox'),
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={t('navigation.visited-pages')}
      className="flex h-11 shrink-0 items-center border-b bg-sidebar px-2"
    >
      <Tabs value={activePathname} onValueChange={openVisitedPageTab}>
        <Tabs.List
          variant="segment"
          className="w-full max-w-full overflow-x-auto rounded-md bg-transparent p-0 styled-scroll"
        >
          {tabs.map((tab) => {
            const label = getVisitedPageTabLabel(tab.pathname, modules, labels);
            const Icon =
              getVisitedPageTabIcon(tab.pathname, modules) ?? IconFile;
            const isActive = tab.pathname === activePathname;

            return (
              <div
                key={tab.pathname}
                className="group/tab flex min-w-0 shrink-0 items-center rounded-md data-[active=true]:bg-background data-[active=true]:shadow-sm"
                data-active={isActive}
              >
                <Tabs.Trigger
                  value={tab.pathname}
                  title={label}
                  className="h-7 min-w-0 max-w-52 gap-1.5 px-2 text-xs"
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </Tabs.Trigger>
                {tabs.length > 1 && (
                  <Button
                    aria-label={t('navigation.close-tab', { page: label })}
                    className="mr-1 size-5 shrink-0 opacity-0 transition-opacity group-hover/tab:opacity-100 group-focus-within/tab:opacity-100"
                    onClick={() => closeVisitedPageTab(tab.pathname)}
                    size="icon"
                    title={t('navigation.close-tab', { page: label })}
                    type="button"
                    variant="ghost"
                  >
                    <IconX className="size-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </Tabs.List>
      </Tabs>
    </nav>
  );
};
