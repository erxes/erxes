import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TAutomationFindObjectConfig } from '@/automations/components/builder/nodes/actions/findObject/states/findObjectConfigForm';
import { MetaFieldLine } from '@/automations/components/builder/nodes/components/MetaFieldLine';

export const FindObjectNodeContent = ({
  config,
}: NodeContentComponentProps<TAutomationFindObjectConfig>) => {
  const { propertyType, propertyField, propertyValue } = config || {};
  const contentType = (propertyType || '').split(':')[1];
  return (
    <>
      <MetaFieldLine
        fieldName="Content Type"
        content={<span className="font-mono capitalize">{contentType}</span>}
      />
      <MetaFieldLine fieldName={propertyField} content={propertyValue} />
    </>
  );
};
