import { SideMenu } from 'erxes-ui';
import { getRelationWidgetLabel, useRelationWidget } from 'ui-modules';

export const TriageSideWidgets = ({ contentId }: { contentId: string }) => {
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
              label={getRelationWidgetLabel(module)}
              Icon={module.icon}
            />
          );
        })}
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
