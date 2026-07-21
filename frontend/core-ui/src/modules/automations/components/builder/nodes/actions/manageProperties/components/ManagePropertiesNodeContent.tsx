import { TAutomationManagePropertyConfig } from '@/automations/components/builder/nodes/actions/manageProperties/types/ManagePropertyTypes';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useTranslation } from 'react-i18next';

export const ManagePropertiesNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationManagePropertyConfig>) => {
  const { t } = useTranslation('automations');
  const { module, rules = [] } = config || {};
  const contentType = (module || '').split(':')[1];
  return (
    <>
      <div className="flex text-slate-600 text-xs ">
        <span className="font-mono">{t('content-type-label', 'Content Type:')} </span>
        <span className="font-mono capitalize">{contentType}</span>
      </div>
      {rules
        .filter(({ field, value }) => field && value)
        .map(({ field, value }, index: number) => (
          <AutomationNodeMetaInfoRow
            key={index}
            fieldName={field}
            content={value}
          />
        ))}
    </>
  );
};
