import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { IconSettings } from '@tabler/icons-react';
import { Button, Popover, Select, Skeleton } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useReEnrollmentRules } from '../hooks/useReEnrollmentRules';

export const AutomationDefaultTriggerHeader = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { control, setValue } = useFormContext<TAutomationBuilderForm>();
  const configFieldNamePrefix: `triggers.${number}.config` = `triggers.${activeNode.nodeIndex}.config`;
  const config = useWatch<TAutomationBuilderForm>({
    control,
    name: configFieldNamePrefix,
  });
  const { recordType = 'every', contentId } = config || {};
  return (
    <div className="p-2 flex flex-row justify-between items-center gap-2">
      <Select
        value={recordType}
        onValueChange={(value) => {
          setValue(`${configFieldNamePrefix}.recordType`, value);
        }}
      >
        <Select.Trigger>
          <Select.Value placeholder="Every records" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="every">Every records</Select.Item>
          <Select.Item value="new">New records only</Select.Item>
          <Select.Item value="existing">Existing records only</Select.Item>
        </Select.Content>
      </Select>
      {recordType !== 'new' && (
        <AutomationTriggerReEnrollmentPopover contentId={contentId} />
      )}
    </div>
  );
};

const AutomationTriggerReEnrollmentPopover = ({
  contentId,
}: {
  contentId: string;
}) => {
  return (
    <Popover>
      <Popover.Trigger>
        <Button variant="ghost" size="icon">
          <IconSettings />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-92">
        <AutomationTriggerReEnrollmentPopoverContent contentId={contentId} />
      </Popover.Content>
    </Popover>
  );
};

const AutomationTriggerReEnrollmentPopoverContent = ({
  contentId,
}: {
  contentId: string;
}) => {
  const {
    reEnrollmentOptions,
    loading: reEnrollmentLoading,
    getLabelByPropertyName,
    hasSubSegmentConditions,
  } = useReEnrollmentRules({ contentId });

  if (reEnrollmentLoading) {
    return <Skeleton className="size-10" />;
  }

  if (!hasSubSegmentConditions) {
    return (
      <p>
        No re-enrollment rules found. Please add a re-enrollment rule to the
        segment.
      </p>
    );
  }

  return (
    <>
      <b>Re-enrollment</b>
      <p className="text-sm text-muted-foreground">
        When a record is updated, the automation will run again.
      </p>
      <div className="flex flex-col gap-2">
        {reEnrollmentOptions.map((option) => (
          <div key={option.propertyName}>
            <p>{getLabelByPropertyName(option.propertyName)}</p>
          </div>
        ))}
      </div>
    </>
  );
};
