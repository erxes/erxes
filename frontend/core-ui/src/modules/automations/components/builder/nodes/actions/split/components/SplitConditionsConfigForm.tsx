import { SplitConditionForm } from '@/automations/components/builder/nodes/actions/split/components/SplitConditionForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { Button, Collapsible, Form, Input, Label } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';
import { useSplitCondtionsConfigForm } from '../hooks/useSplitCondtionsConfigForm';
import { TSplitConditionsConfigForm } from '../states/splitConditionsConfigForm';
import { SplitConditionByOutputVariables } from './SplitConditionByOutputVariables';
import { SplitCondtionRemoveButton } from './SplitCondtionRemoveButton';

export const SplitConditionsConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TSplitConditionsConfigForm>) => {
  const {
    form,
    addOption,
    handleConditionDirtyChange,
    hasDirtyConditionOptions,
    fields,
    contentType,
    isOutputVariableCondition,
    outputVariables,
    handleValidationErrors,
    remove,
  } = useSplitCondtionsConfigForm(currentAction);

  if (!contentType) {
    return (
      <div className="px-4 text-sm text-muted-foreground">
        Select a trigger to configure split conditions
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper
        onSave={form.handleSubmit(
          (config) =>
            handleSave({ ...(currentAction.config || {}), ...config }),
          handleValidationErrors,
        )}
        disabledToSave={hasDirtyConditionOptions}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label>Options</Label>
            <p className="text-sm text-muted-foreground">
              Build each split option with segment conditions.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={addOption}>
            <IconPlus className="size-4" />
            Add option
          </Button>
        </div>
        {hasDirtyConditionOptions && (
          <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            <IconAlertCircle className="size-4 shrink-0" />
            Save each changed condition before saving the split configuration.
          </div>
        )}
        <div className="flex flex-col gap-3">
          {fields.map((option, index) => (
            <Collapsible
              key={option.fieldId}
              defaultOpen={index === 0}
              className="rounded-lg border bg-background"
            >
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <Collapsible.Trigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 shrink-0 px-2"
                  >
                    <Collapsible.TriggerIcon className="size-4" />
                  </Button>
                </Collapsible.Trigger>
                <Form.Field
                  control={form.control}
                  name={`options.${index}.label`}
                  render={({ field }) => (
                    <Form.Item className="min-w-0 flex-1">
                      <Input
                        {...field}
                        className="h-8"
                        placeholder="Option label"
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <SplitCondtionRemoveButton
                  index={index}
                  option={option}
                  disabled={fields.length === 1}
                  onRemove={() => {
                    handleConditionDirtyChange(option.id, false);
                    remove(index);
                  }}
                />
              </div>
              <Collapsible.Content className="min-h-0">
                {isOutputVariableCondition ? (
                  <SplitConditionByOutputVariables
                    contentType={contentType}
                    optionIndex={index}
                    outputVariables={outputVariables}
                  />
                ) : (
                  <Form.Field
                    control={form.control}
                    name={`options.${index}.segmentId`}
                    render={({ field }) => (
                      <SplitConditionForm
                        contentType={contentType}
                        segmentId={field.value}
                        callback={field.onChange}
                        onDirtyChange={(isDirty) =>
                          handleConditionDirtyChange(option.id, isDirty)
                        }
                      />
                    )}
                  />
                )}
              </Collapsible.Content>
            </Collapsible>
          ))}
        </div>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
