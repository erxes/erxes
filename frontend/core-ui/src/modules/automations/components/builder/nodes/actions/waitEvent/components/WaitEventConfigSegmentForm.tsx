import { WaitEventConfigTriggerSelector } from '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventConfigTriggerSelector';
import { useWaitEventConfigContent } from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventConfigContent';
import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { SegmentForm, TAutomationAction } from 'ui-modules';

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
      <Form.Item className="flex-1">
        <Form.Label>Conditions</Form.Label>
        <div className="text-muted-foreground text-sm">
          Select a target to configure conditions
        </div>
      </Form.Item>
    );
  }

  return (
    <>
      <WaitEventConfigTriggerSelector
        targetType={targetType}
        actionId={action.id}
        configFieldNamePrefix={configFieldNamePrefix}
      />
      <Form.Field
        name={`${configFieldNamePrefix}.segmentId`}
        control={control}
        render={({ field }) => (
          <Form.Item className="flex-1 min-h-0 flex flex-col px-4">
            <Form.Label>Conditions</Form.Label>
            <Form.Description>
              Define conditions that must be met before continuing.
            </Form.Description>
            <Form.Message />
            <div className="flex-1 min-h-0">
              <SegmentForm
                contentType={contentType}
                segmentId={field.value}
                callback={field.onChange}
                isTemporary
              />
            </div>
          </Form.Item>
        )}
      />
    </>
  );
}
