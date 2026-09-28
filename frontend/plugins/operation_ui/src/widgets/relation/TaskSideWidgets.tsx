import { PropertiesSidePanel } from '@/operation/components/PropertiesSidePanel';
import { useTaskCustomFieldEdit } from '@/task/hooks/useTaskCustomFieldEdit';
import { IconHierarchy2 } from '@tabler/icons-react';
import { FocusSheet, SideMenuContext } from 'erxes-ui';
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
              module={module.name}
              pluginName={module.pluginName}
              contentId={contentId}
              contentType="operation:task"
            />
          </SideMenuContext.Provider>
        </FocusSheet.SideContent>
      ))}
      <FocusSheet.SideContent value={PROPERTIES_TAB}>
        <PropertiesSidePanel
          contentType="operation:task"
          contentId={contentId}
          propertiesData={propertiesData}
          mutateHook={useTaskCustomFieldEdit}
        />
      </FocusSheet.SideContent>
      <FocusSheet.SideTabsList>
        {relationWidgetsModules.map((module) => (
          <FocusSheet.SideTabsTrigger
            key={module.name}
            value={module.name}
            Icon={module.icon}
            label={getRelationWidgetLabel(module)}
          />
        ))}
        <FocusSheet.SideTabsTrigger
          value={PROPERTIES_TAB}
          label={t('properties', { defaultValue: 'Properties' })}
          Icon={IconHierarchy2}
        />
      </FocusSheet.SideTabsList>
    </FocusSheet.SideTabs>
  );
};