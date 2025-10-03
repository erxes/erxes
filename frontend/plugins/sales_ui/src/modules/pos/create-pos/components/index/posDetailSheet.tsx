import type React from 'react';

import {
  IconLayoutSidebarLeftCollapse,
  IconList,
  IconMaximize,
  IconMinimize,
} from '@tabler/icons-react';
import { Button, cn, Sheet, Tooltip, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { isFullscreenAtom, sidebarViewAtom } from '@/pos/slot/states/slot';
import { posCategoryAtom } from '../../states/posCategory';
import { renderingPosCreateAtom } from '../../states/renderingPosCreateAtom';

export const PosDetailSheet = ({ children }: { children: React.ReactNode }) => {
  const [renderingPosCreate, setRenderingPosCreate] = useAtom(
    renderingPosCreateAtom,
  );
  const [posCategory] = useAtom(posCategoryAtom);
  const [sidebarView, setSidebarView] = useAtom(sidebarViewAtom);
  const [isFullscreen, setIsFullscreen] = useAtom(isFullscreenAtom);
  const [tab, setTab] = useQueryState<string>('tab');
  const [create, setCreate] = useQueryState<boolean>('create', {
    defaultValue: false,
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const setOpen = (isOpen: boolean) => {
    setCreate(isOpen);
    setRenderingPosCreate(false);
    if (!isOpen) {
      setTab(null);
    }
  };

  return (
    <Sheet
      open={create ?? false}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <Sheet.View
        className={cn(
          'p-0 md:max-w-screen-xl flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
          'md:w-[calc(100vw-theme(spacing.4))]',
        )}
      >
        <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
          <Button variant="ghost" size="icon">
            <IconLayoutSidebarLeftCollapse />
          </Button>
          <Sheet.Title>Create POS /{posCategory}/</Sheet.Title>
          {tab === 'slot' && (
            <>
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setSidebarView(
                          sidebarView === 'hidden' ? 'list' : 'hidden',
                        )
                      }
                    >
                      <IconList className="h-4 w-4" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>Toggle Sidebar (Ctrl+B)</p>
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? (
                        <IconMinimize className="h-4 w-4" />
                      ) : (
                        <IconMaximize className="h-4 w-4" />
                      )}
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>Toggle Fullscreen</p>
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </>
          )}
          <Sheet.Close />
          <Sheet.Description className="sr-only text-foreground">
            Create POS
          </Sheet.Description>
        </Sheet.Header>
        {children}
      </Sheet.View>
    </Sheet>
  );
};
