import { TTransformConfigForm } from '@/automations/components/builder/nodes/actions/transform/states/transformForm';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { AutomationNodeMetaInfoRow } from 'ui-modules';

export const TransformNodeContent = ({
  config,
}: NodeContentComponentProps<TTransformConfigForm>) => {
  const mappings = config?.mappings || [];
  const keys = mappings
    .map((mapping) => mapping.key)
    .filter(Boolean)
    .slice(0, 4);
  const remainingCount = mappings.length - keys.length;

  return (
    <AutomationNodeMetaInfoRow
      fieldName="Outputs"
      content={
        keys.length
          ? `${keys.join(', ')}${
              remainingCount > 0 ? ` +${remainingCount}` : ''
            }`
          : 'No mappings'
      }
    />
  );
};
