import { WaitEventConfigContent } from '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventConfigContent';
import { WaitEventTimeoutSection } from '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventTimeoutSection';
import { useWaitEventConfigForm } from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventConfigForm';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form, IconComponent, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const WaitEventConfigForm = ({
  currentAction,
  currentActionIndex,
  handleSave,
}: TAutomationActionProps) => {
  const { control } = useFormContext<TAutomationBuilderForm>();

  const { t } = useTranslation('automations');
  const {
    waitEventOptions,
    configFieldNamePrefix,
    config,
    onSelectTargetTypeId,
    defaultTargetTypeId,
    effectiveTargetType,
  } = useWaitEventConfigForm(currentAction, currentActionIndex);
  const helpId = `target-type-help-${currentAction.id}`;

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 overflow-hidden">
      <Form.Field
        name={`${configFieldNamePrefix}.targetTypeId`}
        control={control}
        defaultValue={defaultTargetTypeId}
        render={({ field }) => (
          <Form.Item className="px-4">
            <Form.Label>
              {t('select-target-type')} ({String(field.value)})
            </Form.Label>
            <Select
              value={field.value ?? defaultTargetTypeId}
              onValueChange={onSelectTargetTypeId}
            >
              <Select.Trigger
                id={`target-type-${currentAction.id}`}
                aria-describedby={helpId}
                className="mt-1"
              >
                <Select.Value placeholder={t('select-target-type')} />
              </Select.Trigger>
              <Select.Content>
                {waitEventOptions.map(({ id, label, icon }) => (
                  <Select.Item key={id} value={id}>
                    <div className="flex items-center gap-2 w-full">
                      {icon && <IconComponent name={icon} className="size-4" />}
                      {label}
                    </div>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Description id={helpId}>
              {t('event-listen-description')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <WaitEventTimeoutSection
        currentAction={currentAction}
        currentActionIndex={currentActionIndex}
      />

      <WaitEventConfigContent
        targetType={effectiveTargetType}
        action={currentAction}
        selectedNodeId={config?.targetTypeId}
        configFieldNamePrefix={configFieldNamePrefix}
        handleSave={handleSave}
      />
    </div>
  );
};
