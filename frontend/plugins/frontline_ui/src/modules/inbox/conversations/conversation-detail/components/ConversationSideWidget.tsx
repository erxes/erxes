import { SideMenu, useSideMenuContext } from 'erxes-ui';
import { useRelationWidget } from 'ui-modules';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { sideWidgetOpenState } from '@/inbox/states/sideWidgetOpenState';

const SideWidgetStateSync = () => {
  const { activeTab } = useSideMenuContext();
  const setSideWidgetOpen = useSetAtom(sideWidgetOpenState);

  useEffect(() => {
    setSideWidgetOpen(!!activeTab);
    return () => setSideWidgetOpen(false);
  }, [activeTab, setSideWidgetOpen]);

  return null;
};

export const ConversationSideWidget = ({
  customerId,
  _id,
}: {
  customerId: string;
  _id: string;
}) => {
  const { relationWidgetsModules, RelationWidget } = useRelationWidget();

  return (
    <SideMenu>
      <SideWidgetStateSync />
      {relationWidgetsModules.map((module) => {
        return (
          <SideMenu.Content value={module.name} key={module.name}>
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
              label={module.name}
              Icon={module.icon}
            />
          );
        })}
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
