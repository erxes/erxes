import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TAutomationFindObjectConfig } from '@/automations/components/builder/nodes/actions/findObject/states/findObjectConfigForm';
import { AutomationNodeMetaInfoRow } from 'ui-modules';

export const FindObjectNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationFindObjectConfig>) => {
  const { propertyType, propertyField, propertyValue } = config || {};
  const contentType = (propertyType || '').split(':')[1];
  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName="Content Type"
        content={<span className="font-mono capitalize">{contentType}</span>}
      />
      <AutomationNodeMetaInfoRow
        fieldName={propertyField}
        content={propertyValue}
      />
    </>
  );
};
