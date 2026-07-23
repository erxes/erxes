import { NavigationPalette } from '@/navigation/components/NavigationPalette';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import { getVisitedPageTabLabel } from '@/navigation/utils/visitedPageTabs';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { Button, Sidebar, Tabs } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const VisitedPageTabs = () => {
  const { t } = useTranslation('common');
  const modules = usePluginsModules();
  const {
    activePathname,
    closeVisitedPageTab,
    openVisitedPageTab,
    reorderVisitedPageTab,
    tabs,
  } = useVisitedPageTabs();
  const { toggleSidebar } = Sidebar.useSidebar();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const draggedPathname = useRef<string | null>(null);
  const labels = {
    details: t('navigation.details'),
    myInbox: t('my-inbox'),
  };

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      if (event.key === '\\') {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
        return;
      }

      const tabIndex = Number(event.key) - 1;
      const tab = tabs[tabIndex];

      if (tabIndex >= 0 && tabIndex < 9 && tab) {
        event.preventDefault();
        openVisitedPageTab(tab.pathname);
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);

    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [openVisitedPageTab, tabs, toggleSidebar]);

  return (
    <>
      <nav
        aria-label={t('navigation.visited-pages')}
        className="fixed inset-x-0 top-0 z-40 flex h-10 items-center gap-1.5 border-b bg-muted px-2"
      >
        <Tabs
          value={activePathname}
          onValueChange={openVisitedPageTab}
          className="min-w-0 flex-1"
        >
          <Tabs.List
            variant="segment"
            className="styled-scroll flex h-8 w-full max-w-full justify-start gap-0.5 overflow-x-auto rounded-none bg-transparent p-0"
          >
            {tabs.map((tab, index) => {
              const label = getVisitedPageTabLabel(
                tab.pathname,
                modules,
                labels,
              );
              const isActive = tab.pathname === activePathname;

              return (
                <div
                  key={tab.pathname}
                  className="group/tab flex h-7 min-w-0 max-w-48 shrink-0 items-center rounded data-[active=true]:bg-background data-[active=true]:shadow-sm"
                  data-active={isActive}
                  draggable
                  onDragEnd={() => {
                    draggedPathname.current = null;
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();

                    if (
                      draggedPathname.current &&
                      draggedPathname.current !== tab.pathname
                    ) {
                      reorderVisitedPageTab(
                        draggedPathname.current,
                        tab.pathname,
                      );
                    }
                  }}
                  onDragStart={(event) => {
                    draggedPathname.current = tab.pathname;
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <Tabs.Trigger
                    value={tab.pathname}
                    title={label}
                    className="h-7 min-w-0 gap-1.5 px-2 text-xs"
                  >
                    <span className="truncate">{label}</span>
                  </Tabs.Trigger>
                  {isActive && index < 9 && (
                    <span className="mr-1 rounded bg-muted px-1 py-0.5 font-mono text-[9px] font-semibold text-accent-foreground">
                      ⌘{index + 1}
                    </span>
                  )}
                  {tabs.length > 1 && (
                    <Button
                      aria-label={t('navigation.close-tab', { page: label })}
                      className="mr-1 size-4 shrink-0 rounded opacity-0 transition-opacity group-hover/tab:opacity-100 group-focus-within/tab:opacity-100 data-[active=true]:opacity-100"
                      data-active={isActive}
                      onClick={() => closeVisitedPageTab(tab.pathname)}
                      size="icon"
                      title={t('navigation.close-tab', { page: label })}
                      type="button"
                      variant="ghost"
                    >
                      <IconX className="size-2.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </Tabs.List>
        </Tabs>
        <Button
          aria-label={t('navigation.open-plugin')}
          className="size-7 shrink-0"
          onClick={() => setPaletteOpen(true)}
          size="icon"
          title={t('navigation.open-plugin')}
          variant="ghost"
        >
          <IconPlus className="size-3.5" />
        </Button>
        <Button
          className="h-7 shrink-0 gap-1.5 px-2 text-xs text-accent-foreground"
          onClick={() => setPaletteOpen(true)}
          title={t('navigation.search')}
          variant="ghost"
        >
          <IconSearch className="size-3.5" />
          <span className="hidden sm:inline">{t('navigation.search')}</span>
          <span className="hidden rounded bg-background px-1 py-0.5 font-mono text-[9px] font-semibold lg:inline">
            ⌘K
          </span>
        </Button>
      </nav>
      <NavigationPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
};
