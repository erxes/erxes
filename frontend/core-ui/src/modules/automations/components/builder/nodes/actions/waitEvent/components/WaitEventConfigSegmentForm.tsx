import { useWaitEventConfigContent } from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventConfigContent';
import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';
import { AutomationSegmentForm } from '@/automations/components/common/AutomationSegmentForm';

export function WaitEventConfigSegmentForm({
  targetType,
  action,
  selectedNodeId,
  configFieldNamePrefix,
}: {
  targetType: TAutomationWaitEventConfig['targetType'];
  action: TAutomationAction;
  selectedNodeId?: string;
  configFieldNamePrefix: TAutomationActionConfigFieldPrefix;
}) {
  const { control } = useFormContext<TAutomationBuilderForm>();

  const { contentType } = useWaitEventConfigContent(
    targetType,
    action,
    selectedNodeId,
  );
  if (!contentType) {
    return (
      <Form.Item className="flex-1 px-4">
        <Form.Label>Conditions</Form.Label>
        <div className="text-muted-foreground text-sm">
          Select a target to configure conditions
        </div>
      </Form.Item>
    );
  }

  return (
    <>
      <Form.Field
        name={`${configFieldNamePrefix}.segmentId`}
        control={control}
        render={({ field }) => (
          <Form.Item className="flex-1 min-h-0 flex flex-col px-4">
            <Form.Label>Conditions {`(${field.value})`}</Form.Label>
            <Form.Description>
              Define conditions that must be met before continuing.
            </Form.Description>
            <Form.Message />
            <div className="flex-1 min-h-0 w-[650px]">
              <AutomationSegmentForm
                contentType={contentType}
                segmentId={field.value}
                callback={field.onChange}
              />
            </div>
          </Form.Item>
        )}
      />
    </>
  );
}
