import { PropertiesSidePanel } from '@/operation/components/PropertiesSidePanel';
import { useTaskCustomFieldEdit } from '@/task/hooks/useTaskCustomFieldEdit';
import { IconHierarchy2 } from '@tabler/icons-react';
import { SideMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { getRelationWidgetLabel, useRelationWidget } from 'ui-modules';

const PROPERTIES_TAB = 'operation-properties';

export const TaskSideWidgets = ({
  contentId,
  propertiesData,
}: {
  contentId: string;
  propertiesData?: Record<string, unknown>;
}) => {
  const { t } = useTranslation('operation');
  const { relationWidgetsModules, RelationWidget } = useRelationWidget({
    hiddenPlugins: ['operation'],
  });

  return (
    <SideMenu className="shrink-0">
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
      <SideMenu.Content value={PROPERTIES_TAB}>
        <PropertiesSidePanel
          contentType="operation:task"
          contentId={contentId}
          propertiesData={propertiesData}
          mutateHook={useTaskCustomFieldEdit}
        />
      </SideMenu.Content>
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
        <SideMenu.Trigger
          value={PROPERTIES_TAB}
          label={t('properties', { defaultValue: 'Properties' })}
          Icon={IconHierarchy2}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
