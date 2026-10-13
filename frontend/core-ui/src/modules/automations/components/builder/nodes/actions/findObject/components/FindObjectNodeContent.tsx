import { useTranslation } from 'react-i18next';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TAutomationFindObjectConfig } from '@/automations/components/builder/nodes/actions/findObject/states/findObjectConfigForm';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeMetaInfoRow } from 'ui-modules';

export const FindObjectNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationFindObjectConfig>) => {
  const { t } = useTranslation('automations');
  const { findObjectTargetsConst } = useAutomation();
  const { objectType, lookupField, value } = config || {};
  const target = findObjectTargetsConst.find(
    (item) => item.value === objectType,
  );
  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName={t('record-type')}
        content={
          <span className="font-mono">{target?.label || objectType}</span>
        }
      />
      <AutomationNodeMetaInfoRow
        fieldName={lookupField || t('value')}
        content={value}
      />
    </>
  );
};
