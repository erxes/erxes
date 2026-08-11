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
      const isOutside =
        !!target &&
        !!container &&
        !!boundary &&
        boundary.contains(target) &&
        !container.contains(target);

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
    <SideMenu ref={sideMenuRef} className="flex-none">
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
            className={cn(
              'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-4 duration-150 motion-reduce:animate-none',
              asSheet
                ? // Docked under the conversation header instead of taking a column.
                  'absolute top-11 bottom-0 right-16 z-20 shadow-xl data-[state=active]:w-[min(20rem,calc(100%_-_4rem))]'
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

      <SideMenu.Sidebar>
        {relationWidgetsModules.map((module) => {
          return (
            <SideMenu.Trigger
              key={module.name}
              value={module.name}
              label={getRelationWidgetLabel(module)}
              Icon={module.icon}
            />
          );
        })}
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
