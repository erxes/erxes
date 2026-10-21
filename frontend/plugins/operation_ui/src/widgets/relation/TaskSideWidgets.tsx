import { PropertiesSidePanel } from '@/operation/components/PropertiesSidePanel';
import { useTaskCustomFieldEdit } from '@/task/hooks/useTaskCustomFieldEdit';
import { IconHierarchy2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { RelationWidgetSideTabs } from 'ui-modules';

const PROPERTIES_TAB = 'operation-properties';

export const TaskSideWidgets = ({
  contentId,
  propertiesData,
  customerIds,
  companyIds,
}: {
  contentId: string;
  propertiesData?: Record<string, unknown>;
  // The task's own contacts.
  customerIds?: (string | null)[] | null;
  companyIds?: (string | null)[] | null;
}) => {
  const { t } = useTranslation('operation');

  return (
    <RelationWidgetSideTabs
      customerIds={customerIds}
      companyIds={companyIds}
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
