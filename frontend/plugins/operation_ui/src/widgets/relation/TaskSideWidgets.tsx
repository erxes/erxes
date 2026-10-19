import { PropertiesSidePanel } from '@/operation/components/PropertiesSidePanel';
import { useTaskCustomFieldEdit } from '@/task/hooks/useTaskCustomFieldEdit';
import { IconHierarchy2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { RelationWidgetSideTabs } from 'ui-modules';

const PROPERTIES_TAB = 'operation-properties';

export const TaskSideWidgets = ({
  contentId,
  propertiesData,
}: {
  contentId: string;
  propertiesData?: Record<string, unknown>;
}) => {
  const { t } = useTranslation('operation');

  return (
    <RelationWidgetSideTabs
      contentId={contentId}
      contentType="operation:task"
      hookOptions={{ hiddenPlugins: ['operation'] }}
      extraTabs={[
        {
          value: PROPERTIES_TAB,
          label: t('properties', { defaultValue: 'Properties' }),
          icon: IconHierarchy2,
          content: (
            <PropertiesSidePanel
              contentType="operation:task"
              contentId={contentId}
              propertiesData={propertiesData}
              mutateHook={useTaskCustomFieldEdit}
            />
          ),
        },
      ]}
    />
  );
};
