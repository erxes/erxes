import { SideMenu, cn, useSideMenuContext } from 'erxes-ui';
import { RefObject, useEffect, useRef } from 'react';
import { getRelationWidgetLabel, useRelationWidget } from 'ui-modules';

// Bounded to the conversation area so the widget's own portals do not count.
const SideWidgetOutsideClose = ({
  containerRef,
  boundaryRef,
}: {
  containerRef: RefObject<HTMLDivElement>;
  boundaryRef: RefObject<HTMLElement>;
}) => {
  const { activeTab, setActiveTab } = useSideMenuContext();

  useEffect(() => {
    if (!activeTab) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const container = containerRef.current;
      const boundary = boundaryRef.current;
      const activeContent = container?.querySelector(
        '[data-side-widget-content][data-state="active"]',
      );
      const sidebar = container?.querySelector('[data-side-widget-sidebar]');
      const isOutside =
        target !== null &&
        container !== null &&
        boundary !== null &&
        boundary.contains(target) &&
        !activeContent?.contains(target) &&
        !sidebar?.contains(target);

      if (isOutside) {
        setActiveTab();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [activeTab, boundaryRef, containerRef, setActiveTab]);

  return null;
};

export const ConversationSideWidget = ({
  customerId,
  _id,
  asSheet,
  boundaryRef,
}: {
  customerId: string;
  _id: string;
  asSheet?: boolean;
  boundaryRef: RefObject<HTMLElement>;
}) => {
  const { relationWidgetsModules, RelationWidget } = useRelationWidget();
  const sideMenuRef = useRef<HTMLDivElement>(null);

  return (
    <SideMenu
      ref={sideMenuRef}
      className={cn(
        'flex-none',
        asSheet && 'absolute inset-0 z-30 pointer-events-none',
      )}
    >
      {asSheet && (
        <SideWidgetOutsideClose
          containerRef={sideMenuRef}
          boundaryRef={boundaryRef}
        />
      )}
      {relationWidgetsModules.map((module) => {
        return (
          <SideMenu.Content
            value={module.name}
            key={module.name}
            data-side-widget-content
            className={cn(
              'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-4 duration-150 motion-reduce:animate-none',
              asSheet
                ? 'pointer-events-auto absolute inset-y-0 right-12 z-30 data-[state=active]:!w-[min(20rem,calc(100%_-_3rem))] shadow-xl'
                : 'flex-none data-[state=active]:w-72 lg:data-[state=active]:w-80',
            )}
          >
            <RelationWidget
              key={module.name}
              module={module.name}
              pluginName={module.pluginName}
              contentId={_id}
              contentType="frontline:conversation"
              customerId={customerId}
            />
          </SideMenu.Content>
        );
      })}

      <SideMenu.Sidebar
        data-side-widget-sidebar
        className={cn(
          asSheet &&
            'pointer-events-auto absolute inset-y-0 right-0 z-40 flex w-12 overflow-y-auto border-l bg-sidebar/95 shadow-lg backdrop-blur',
        )}
      >
        {relationWidgetsModules.map((module) => {
          return (
            <SideMenu.Trigger
              key={module.name}
              value={module.name}
              label={getRelationWidgetLabel(module)}
              aria-label={getRelationWidgetLabel(module)}
              Icon={module.icon}
            />
          );
        })}
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
