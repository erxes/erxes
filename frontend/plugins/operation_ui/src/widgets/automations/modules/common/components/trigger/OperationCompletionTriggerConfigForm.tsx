import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { SelectMilestone } from '@/task/components/task-selects/SelectMilestone';
import { SelectTeam } from '@/team/components/SelectTeam';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { Control, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  splitAutomationNodeType,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  operationCompletionTriggerConfigFormSchema,
  TOperationCompletionTriggerConfigForm,
} from '../../states/operationCompletionTriggerFormDefinitions';
import { OperationCompletionModeInput } from './OperationCompletionModeInput';

const normalizeIds = (value: string | string[] | null) =>
  Array.isArray(value) ? value : value ? [value] : [];

export const OperationCompletionTriggerConfigForm = ({
  type,
  formRef,
  onSaveTriggerConfig,
  activeTrigger,
}: AutomationTriggerFormProps<TOperationCompletionTriggerConfigForm>) => {
  const { t } = useTranslation('operation');
  const triggerType = type || activeTrigger?.type;
  const [, moduleName, collectionType] = splitAutomationNodeType(triggerType);
  const currentConfig = activeTrigger?.config;
  const form = useForm<TOperationCompletionTriggerConfigForm>({
    resolver: zodResolver(operationCompletionTriggerConfigFormSchema),
    defaultValues: {
      mode: 'every',
      ...currentConfig,
      teamIds: normalizeIds(currentConfig?.teamIds || []),
    },
  });
  const { control, handleSubmit } = form;
  const projectId = useWatch({
    control,
    name: 'projectId',
  });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Operation Completion Trigger Configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveTriggerConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      {moduleName === 'project' && collectionType === 'projects' ? (
        <Form.Field
          control={control}
          name="projectId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('project')}</Form.Label>
              <SelectProject.FormItem
                value={field.value || ''}
                onValueChange={(value) => field.onChange(value || '')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      ) : null}

      {moduleName === 'project' && collectionType === 'milestones' ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Form.Field
              control={control}
              name="projectId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('project')}</Form.Label>
                  <SelectProject.FormItem
                    value={field.value || ''}
                    onValueChange={(value) => {
                      field.onChange(value || '');
                      form.setValue('milestoneId', '');
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

          <CompletionModeField control={control} />
        </>
      ) : null}

      {moduleName === 'team' ? (
        <>
          <Form.Field
            control={control}
            name="teamIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('teams')}</Form.Label>
                <SelectTeam.FormItem
                  mode="multiple"
                  value={field.value || []}
                  onValueChange={(value) => field.onChange(normalizeIds(value))}
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <CompletionModeField control={control} />
        </>
      ) : null}
    </Form>
  );
};

const CompletionModeField = ({
  control,
}: {
  control: Control<TOperationCompletionTriggerConfigForm>;
}) => {
  const { t } = useTranslation('operation');
  return (
    <Form.Field
      control={control}
      name="mode"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('completion-mode')}</Form.Label>
          <OperationCompletionModeInput
            value={field.value}
            onChange={field.onChange}
          />
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
