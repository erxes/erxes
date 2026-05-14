import { SideMenu } from 'erxes-ui';
import { useRelationWidget } from 'ui-modules';

export const TaskSideWidgets = ({ contentId }: { contentId: string }) => {
  const { relationWidgetsModules, RelationWidget } = useRelationWidget({
    hiddenPlugins: ['operation'],
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
              contentType="operation:task"
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
