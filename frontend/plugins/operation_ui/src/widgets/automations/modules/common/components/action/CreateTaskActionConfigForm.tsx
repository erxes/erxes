import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectTriggerOperation } from '@/operation/components/SelectOperation';
import { useTranslation } from 'react-i18next';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { SelectMilestone } from '@/task/components/task-selects/SelectMilestone';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectTeam } from '@/team/components/SelectTeam';
import { zodResolver } from '@hookform/resolvers/zod';
import { Combobox, Form, PopoverScoped } from 'erxes-ui';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Control, useForm, useWatch } from 'react-hook-form';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  TPlaceholderInputSuggestionType,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { OPERATION_TASK_TARGET_TYPE } from '../../constants/operationAutomationConstants';
import {
  taskActionConfigFormSchema,
  TOperationActionConfigForm,
  TTaskActionConfigForm,
} from '../../states/operationActionConfigFormDefinitions';

type TPlaceholderFieldName =
  | 'name'
  | 'description'
  | 'assigneeId'
  | 'startDate'
  | 'targetDate'
  | 'tagIds';

const getSingleValue = (value: string | string[] | null) =>
  Array.isArray(value) ? value[0] || '' : value || '';

const getTaskActionConfig = (
  config?: TOperationActionConfigForm,
): Partial<TTaskActionConfigForm> =>
  config && 'teamId' in config ? config : {};

const PlaceholderFormField = ({
  control,
  name,
  label,
  propertyType,
  variant,
  selectMode = 'one',
  enabled,
  selectionType,
  suggestionsOptions,
}: {
  control: Control<TTaskActionConfigForm>;
  name: TPlaceholderFieldName;
  label: string;
  propertyType: string;
  variant?: 'expression' | 'fixed';
  selectMode?: 'one' | 'many';
  enabled?: readonly TPlaceholderInputSuggestionType[];
  selectionType?: ComponentProps<typeof PlaceholderInput>['selectionType'];
  suggestionsOptions?: ComponentProps<
    typeof PlaceholderInput
  >['suggestionsOptions'];
}) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <PlaceholderInput
          propertyType={propertyType}
          value={field.value || ''}
          onChange={field.onChange}
          variant={variant}
          placeholderConfig={{
            selectMode,
            delimiter: selectMode === 'many' ? ',' : undefined,
            allowOnlyTriggers: true,
          }}
          enabled={enabled}
          selectionType={selectionType}
          suggestionsOptions={suggestionsOptions}
        >
          {variant === 'expression' ? <PlaceholderInput.Header /> : null}
        </PlaceholderInput>
        <Form.Message />
      </Form.Item>
    )}
  />
);

const TaskStatusFormItem = ({
  value,
  teamId,
  onValueChange,
}: {
  value: string;
  teamId?: string;
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusTask.Provider
      value={value}
      teamId={teamId}
      onValueChange={(status) => {
        onValueChange(status);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerOperation variant="form">
          <SelectStatusTask.Value />
        </SelectTriggerOperation>
        <Combobox.Content>
          <SelectStatusTask.Content />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusTask.Provider>
  );
};

export const CreateTaskActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: Omit<
  AutomationActionFormProps<TOperationActionConfigForm>,
  'onSaveActionConfig'
> & {
  onSaveActionConfig: (config: TTaskActionConfigForm) => void;
}) => {
  const { t } = useTranslation('operation');
  const propertyType = targetType || OPERATION_TASK_TARGET_TYPE;
  const currentConfig = getTaskActionConfig(currentAction?.config);
  const form = useForm<TTaskActionConfigForm>({
    resolver: zodResolver(taskActionConfigFormSchema),
    defaultValues: {
      ...currentConfig,
      priority: Number(currentConfig?.priority || 0),
    },
  });
  const { control, handleSubmit, setValue } = form;
  const [teamId, projectId] = useWatch({
    control,
    name: ['teamId', 'projectId'],
  });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Create Task Action Configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveActionConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name')}</Form.Label>
            <PlaceholderInput
              propertyType={propertyType}
              value={field.value || ''}
              onChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('description')}</Form.Label>
            <PlaceholderInput
              propertyType={propertyType}
              value={field.value || ''}
              onChange={field.onChange}
              variant="expression"
            />
            <Form.Message />
          </Form.Item>
        )}
      />

      <div className="grid grid-cols-2 gap-2">
        <Form.Field
          control={control}
          name="teamId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('team')}</Form.Label>
              <SelectTeam.FormItem
                mode="single"
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(getSingleValue(value));
                  setValue('status', '');
                  setValue('projectId', '');
                  setValue('milestoneId', '');
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="status"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('status')}</Form.Label>
              <TaskStatusFormItem
                value={field.value || ''}
                teamId={teamId}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Form.Field
          control={control}
          name="priority"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('priority')}</Form.Label>
              <SelectPriority.FormItem
                value={field.value || 0}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <PlaceholderFormField
          control={control}
          name="assigneeId"
          label="Assignee"
          propertyType={propertyType}
          enabled={[TPlaceholderInputSuggestion.CallUser]}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Form.Field
          control={control}
          name="projectId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('project')}</Form.Label>
              <SelectProject.FormItem
                teamId={teamId}
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value || '');
                  setValue('milestoneId', '');
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="milestoneId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('milestone')}</Form.Label>
              <SelectMilestone.FormItem
                projectId={projectId}
                value={field.value || ''}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PlaceholderFormField
          control={control}
          name="startDate"
          label="Start date"
          propertyType={propertyType}
          enabled={[TPlaceholderInputSuggestion.Date]}
        />
        <PlaceholderFormField
          control={control}
          name="targetDate"
          label="Target date"
          propertyType={propertyType}
          enabled={[TPlaceholderInputSuggestion.Date]}
        />
      </div>

      <PlaceholderFormField
        control={control}
        name="tagIds"
        label="Tags"
        propertyType={propertyType}
        selectMode="many"
        enabled={[TPlaceholderInputSuggestion.CallTag]}
      />
    </Form>
  );
};
