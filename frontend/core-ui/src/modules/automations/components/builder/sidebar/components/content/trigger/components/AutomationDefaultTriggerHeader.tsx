import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { IconSettings } from '@tabler/icons-react';
import { Button, Checkbox, Label, Popover, Select, Skeleton } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useReEnrollmentRules } from '../hooks/useReEnrollmentRules';
import { useTriggerReEnrollment } from '../hooks/useTriggerReEnrollment';

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
        <AutomationTriggerReEnrollmentPopover
          activeNode={activeNode}
          contentId={contentId}
        />
      )}
    </div>
  );
};

const AutomationTriggerReEnrollmentPopover = ({
  activeNode,
  contentId,
}: {
  activeNode: NodeData;
  contentId: string;
}) => {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon">
          <IconSettings />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-92">
        <AutomationTriggerReEnrollmentPopoverContent
          activeNode={activeNode}
          contentId={contentId}
        />
      </Popover.Content>
    </Popover>
  );
};

const AutomationTriggerReEnrollmentPopoverContent = ({
  activeNode,
  contentId,
}: {
  activeNode: NodeData;
  contentId: string;
}) => {
  const { t } = useTranslation('automations');
  const {
    reEnrollmentOptions,
    loading: reEnrollmentLoading,
    hasSubSegmentConditions,
  } = useReEnrollmentRules({ contentId });
  const { fieldRules, toggleField } = useTriggerReEnrollment(activeNode);

  if (reEnrollmentLoading) {
    return <Skeleton className="size-10" />;
  }

  return (
    <div className="flex flex-col gap-2">
      <b>{t('re-enrollment')}</b>
      <p className="text-sm text-muted-foreground">
        {t(
          hasSubSegmentConditions
            ? 're-enrollment-fields-hint'
            : 're-enrollment-no-fields',
        )}
      </p>
      {reEnrollmentOptions.map((option) => (
        <div key={option.propertyName} className="flex items-center gap-2">
          <Checkbox
            id={`reEnroll-${option.propertyName}`}
            checked={fieldRules.includes(option.propertyName)}
            onCheckedChange={(value) =>
              toggleField(option.propertyName, value === true)
            }
          />
          <Label htmlFor={`reEnroll-${option.propertyName}`}>
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
};
