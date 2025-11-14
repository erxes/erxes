import { SideMenu } from 'erxes-ui';
import { useRelationWidget } from 'ui-modules';

export const TicketSideWidgets = ({ contentId }: { contentId: string }) => {
  const { relationWidgetsModules, RelationWidget } = useRelationWidget({
    hiddenPlugins: ['frontline'],
  });

  return (
    <SideMenu>
      {relationWidgetsModules.map((module) => {
        return (
          <SideMenu.Content value={module.name} key={module.name}>
            <RelationWidget
              key={module.name}
              module={module.name}
              pluginName={module.pluginName}
              contentId={contentId}
              contentType="frontline:ticket"
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
