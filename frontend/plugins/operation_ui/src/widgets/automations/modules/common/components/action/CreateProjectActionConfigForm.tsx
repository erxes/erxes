import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { SelectTeam } from '@/team/components/SelectTeam';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { Control, useForm } from 'react-hook-form';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { OPERATION_PROJECT_TARGET_TYPE } from '../../constants/operationAutomationConstants';
import {
  projectActionConfigFormSchema,
  TOperationActionConfigForm,
  TProjectActionConfigForm,
} from '../../states/operationActionConfigFormDefinitions';

type TPlaceholderFieldName =
  | 'name'
  | 'description'
  | 'leadId'
  | 'memberIds'
  | 'startDate'
  | 'targetDate'
  | 'tagIds';

const normalizeIds = (value: string | string[] | null) =>
  Array.isArray(value) ? value : value ? [value] : [];

const getProjectActionConfig = (
  config?: TOperationActionConfigForm,
): Partial<TProjectActionConfigForm> =>
  config && 'teamIds' in config ? config : {};

const PlaceholderFormField = ({
  control,
  name,
  label,
  propertyType,
  variant,
  selectMode = 'one',
  enabled,
}: {
  control: Control<TProjectActionConfigForm>;
  name: TPlaceholderFieldName;
  label: string;
  propertyType: string;
  variant?: 'expression' | 'fixed';
  selectMode?: 'one' | 'many';
  enabled?: Record<string, boolean>;
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
        >
          {variant === 'expression' ? <PlaceholderInput.Header /> : null}
        </PlaceholderInput>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const CreateProjectActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: Omit<
  AutomationActionFormProps<TOperationActionConfigForm>,
  'onSaveActionConfig'
> & {
  onSaveActionConfig: (config: TProjectActionConfigForm) => void;
}) => {
  const propertyType = targetType || OPERATION_PROJECT_TARGET_TYPE;
  const currentConfig = getProjectActionConfig(currentAction?.config);
  const form = useForm<TProjectActionConfigForm>({
    resolver: zodResolver(projectActionConfigFormSchema),
    defaultValues: {
      ...currentConfig,
      teamIds: normalizeIds(currentConfig?.teamIds || []),
      status: Number(currentConfig?.status || 0),
      priority: Number(currentConfig?.priority || 0),
    },
  });
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Create Project Action Configuration',
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
            <Form.Label>Name</Form.Label>
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
            <Form.Label>Description</Form.Label>
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
      <Form.Field
        control={control}
        name="teamIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Teams</Form.Label>
            <SelectTeam.FormItem
              mode="multiple"
              value={field.value || []}
              onValueChange={(value) => field.onChange(normalizeIds(value))}
            />
            <Form.Message />
          </Form.Item>
        )}
      />

      <div className="grid grid-cols-2 gap-2">
        <Form.Field
          control={control}
          name="status"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Status</Form.Label>
              <SelectStatus.FormItem
                value={field.value || 0}
                onValueChange={field.onChange}
                useExtendedLabels
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="priority"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Priority</Form.Label>
              <SelectPriority.FormItem
                value={field.value || 0}
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
          name="leadId"
          label="Lead"
          propertyType={propertyType}
          enabled={{ call_user: true }}
        />
        <PlaceholderFormField
          control={control}
          name="memberIds"
          label="Members"
          propertyType={propertyType}
          selectMode="many"
          enabled={{ call_user: true }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PlaceholderFormField
          control={control}
          name="startDate"
          label="Start date"
          propertyType={propertyType}
          enabled={{ date: true }}
        />
        <PlaceholderFormField
          control={control}
          name="targetDate"
          label="Target date"
          propertyType={propertyType}
          enabled={{ date: true }}
        />
      </div>

      <PlaceholderFormField
        control={control}
        name="tagIds"
        label="Tags"
        propertyType={propertyType}
        selectMode="many"
        enabled={{ call_tag: true }}
      />
    </Form>
  );
};
