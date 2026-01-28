import { FocusSheet } from 'erxes-ui';
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
          <FocusSheet.SideContentHeader
            Icon={module.icon}
            label={module.name}
          />
          <RelationWidget
            module={module.name}
            pluginName={module.pluginName}
            contentId={contentId}
            contentType={contentType}
          />
        </FocusSheet.SideContent>
      ))}
      <FocusSheet.SideTabsList>
        {relationWidgetsModules.map((module) => (
          <FocusSheet.SideTabsTrigger
            key={module.name}
            value={module.name}
            Icon={module.icon}
            label={module.name}
          />
        ))}
      </FocusSheet.SideTabsList>
    </FocusSheet.SideTabs>
  );
};
