import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { AutomationNodeMetaInfoRow } from 'ui-modules';

export const TransformActionResult = ({
  result,
}: ActionResultComponentProps<{ data?: Record<string, any> }>) => {
  const data = result?.data || {};
  const entries = Object.entries(data);

  if (!entries.length) {
    return <AutomationNodeMetaInfoRow fieldName="Data" content="No output" />;
  }

  return (
    <>
      {entries.slice(0, 8).map(([key, value]) => (
        <AutomationNodeMetaInfoRow
          key={key}
          fieldName={key}
          content={
            typeof value === 'object' && value !== null
              ? JSON.stringify(value)
              : String(value)
          }
        />
      ))}
      {entries.length > 8 ? (
        <AutomationNodeMetaInfoRow
          fieldName="More"
          content={`${entries.length - 8} more fields`}
        />
      ) : null}
    </>
  );
};
