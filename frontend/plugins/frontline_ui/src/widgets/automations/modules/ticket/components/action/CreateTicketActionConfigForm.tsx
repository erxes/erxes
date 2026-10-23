import { PROJECT_PRIORITIES_OPTIONS } from '@/ticket/constants/priorityOption';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Control, useForm, UseFormReturn } from 'react-hook-form';
import {
  AutomationActionFormProps,
  AutomationConditionalField,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  TPlaceholderInputSuggestionsOption,
  TPlaceholderInputSuggestionType,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  TTicketActionConfigForm,
  ticketActionConfigFormSchema,
} from '../../states/ticketActionConfigFormDefinitions';
import { TicketPlacementFields } from './TicketPlacementFields';

const TICKET_PROPERTY_TYPE = 'frontline:ticket.tickets';

type TPlaceholderFieldName =
  | 'name'
  | 'description'
  | 'priority'
  | 'assigneeId'
  | 'startDate'
  | 'targetDate'
  | 'labelIds'
  | 'tagIds'
  | 'companyId'
  | 'attachmentIds';

type TPlaceholderFieldOptions = {
  propertyType: string;
  variant?: 'expression' | 'fixed';
  selectMode?: 'one' | 'many';
  enabled?: readonly TPlaceholderInputSuggestionType[];
  selectionType?: TPlaceholderInputSuggestionType;
  suggestionsOptions?: Partial<
    Record<string, TPlaceholderInputSuggestionsOption>
  >;
};

const TicketPlaceholderInput = ({
  value,
  onChange,
  propertyType,
  variant,
  selectMode = 'one',
  enabled,
  selectionType,
  suggestionsOptions,
}: TPlaceholderFieldOptions & {
  value?: string;
  onChange: (value: string) => void;
}) => (
  <PlaceholderInput
    propertyType={propertyType}
    value={value || ''}
    onChange={onChange}
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
);

const PlaceholderFormField = ({
  control,
  name,
  label,
  ...options
}: TPlaceholderFieldOptions & {
  control: Control<TTicketActionConfigForm>;
  name: TPlaceholderFieldName;
  label: string;
}) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <TicketPlaceholderInput
          {...options}
          value={field.value}
          onChange={field.onChange}
        />
        <Form.Message />
      </Form.Item>
    )}
  />
);

// Same input, but the value may be chosen by conditions at run time
const ConditionalPlaceholderFormField = ({
  form,
  name,
  label,
  ...options
}: TPlaceholderFieldOptions & {
  form: UseFormReturn<TTicketActionConfigForm>;
  name: TPlaceholderFieldName;
  label: string;
}) => (
  <AutomationConditionalField
    form={form}
    names={[name]}
    label={label}
    render={({ field }) => (
      <TicketPlaceholderInput
        {...options}
        value={field.value}
        onChange={field.onChange}
      />
    )}
  />
);

export const CreateTicketActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TTicketActionConfigForm>) => {
  const { t } = useTranslation('frontline');
  const propertyType = targetType || TICKET_PROPERTY_TYPE;
  const form = useForm<TTicketActionConfigForm>({
    resolver: zodResolver(ticketActionConfigFormSchema),
    defaultValues: {
      ...(currentAction?.config || {}),
    },
  });
  const { control, handleSubmit } = form;

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Ticket Action Configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveActionConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <AutomationConditionalField
        form={form}
        names={['channelId', 'pipelineId', 'statusId']}
        label={t('ticket-placement', 'Channel / Pipeline / Status')}
        render={({ form: placementForm }) => (
          <TicketPlacementFields form={placementForm} />
        )}
      />

      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name', 'Name')}</Form.Label>
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
            <Form.Label>{t('description', 'Description')}</Form.Label>
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
        <ConditionalPlaceholderFormField
          form={form}
          name="priority"
          label={t('priority-label', 'Priority')}
          propertyType={propertyType}
          enabled={[TPlaceholderInputSuggestion.Option]}
          selectionType={TPlaceholderInputSuggestion.Option}
          suggestionsOptions={{
            option: {
              options: PROJECT_PRIORITIES_OPTIONS.map((label, value) => ({
                label,
                value: String(value),
              })),
            },
          }}
        />
        <ConditionalPlaceholderFormField
          form={form}
          name="assigneeId"
          label={t('assignee', 'Assignee')}
          propertyType={propertyType}
          enabled={[TPlaceholderInputSuggestion.CallUser]}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PlaceholderFormField
          control={control}
          name="startDate"
          label={t('start-date', 'Start date')}
          propertyType={propertyType}
          enabled={[TPlaceholderInputSuggestion.Date]}
        />
        <PlaceholderFormField
          control={control}
          name="targetDate"
          label={t('target-date', 'Target date')}
          propertyType={propertyType}
          enabled={[TPlaceholderInputSuggestion.Date]}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <PlaceholderFormField
          control={control}
          name="tagIds"
          label={t('tags', 'Tags')}
          propertyType={propertyType}
          selectMode="many"
          enabled={[TPlaceholderInputSuggestion.CallTag]}
        />
        <PlaceholderFormField
          control={control}
          name="labelIds"
          label={t('labels', 'Labels')}
          propertyType={propertyType}
          selectMode="many"
        />
        <PlaceholderFormField
          control={control}
          name="companyId"
          label={t('company', 'Company')}
          propertyType={propertyType}
          selectMode="one"
          enabled={[TPlaceholderInputSuggestion.CallCompany]}
        />
      </div>

      <PlaceholderFormField
        control={control}
        name="attachmentIds"
        label={t('ticket-attachment-media', 'Attachments (conversation media)')}
        propertyType={propertyType}
        selectMode="many"
      />
    </Form>
  );
};
