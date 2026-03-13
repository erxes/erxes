import { FocusSheet, SideMenuContext } from 'erxes-ui';
import { useRelationWidget } from '../widget-provider/context/widgetContext';

export const RelationWidgetSideTabs = ({
  contentId,
  contentType,
  hookOptions,
}: {
  contentId: string;
  contentType: string;
  hookOptions?: {
    hiddenPlugins?: string[];
    hiddenModules?: string[];
    hideCoreRelations?: boolean;
  };
}) => {
  const { RelationWidget, relationWidgetsModules } =
    useRelationWidget(hookOptions);
  return (
    <FocusSheet.SideTabs>
      {relationWidgetsModules.map((module) => (
        <FocusSheet.SideContent key={module.name} value={module.name}>
          <SideMenuContext.Provider
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            value={{ activeTab: module.name, setActiveTab: () => {} }}
          >
            <RelationWidget
              module={module.name}
              pluginName={module.pluginName}
              contentId={contentId}
              contentType={contentType}
            />
          </SideMenuContext.Provider>
        </FocusSheet.SideContent>
      ))}
      <FocusSheet.SideTabsList>
        {relationWidgetsModules.map((module) => (
          <FocusSheet.SideTabsTrigger
            key={module.name}
            value={module.name}
            Icon={module.icon}
            label={module.name.charAt(0).toUpperCase() + module.name.slice(1)}
          />
        ))}
      </FocusSheet.SideTabsList>
    </FocusSheet.SideTabs>
  );
};
