import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import {
  SelectTicketContent,
  SelectTriggerTicket,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { PROJECT_PRIORITIES_OPTIONS } from '@/ticket/constants/priorityOption';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, PopoverScoped } from 'erxes-ui';
import { useState } from 'react';
import { Control, useForm, useWatch } from 'react-hook-form';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  TTicketActionConfigForm,
  ticketActionConfigFormSchema,
} from '../../states/ticketActionConfigFormDefinitions';

const TICKET_PROPERTY_TYPE = 'frontline:ticket.tickets';
const FULL_WIDTH_SELECT_ITEM_CLASS =
  'min-w-0 [&_[role=combobox]]:w-full [&_[role=combobox]]:max-w-none';

type TPlaceholderFieldName =
  | 'name'
  | 'description'
  | 'priority'
  | 'assigneeId'
  | 'startDate'
  | 'targetDate'
  | 'labelIds'
  | 'tagIds'
  | 'companyIds';

const TicketStatusConfigSelect = ({
  value,
  onValueChange,
  pipelineId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  pipelineId?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusTicket.Provider
      value={value}
      pipelineId={pipelineId}
      onValueChange={(statusId) => {
        onValueChange(statusId);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectStatusTicket.Value />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectStatusTicket.Content />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStatusTicket.Provider>
  );
};

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
  control: Control<TTicketActionConfigForm>;
  name: TPlaceholderFieldName;
  label: string;
  propertyType: string;
  variant?: 'expression' | 'fixed';
  selectMode?: 'one' | 'many';
  enabled?: Record<string, boolean>;
  selectionType?: React.ComponentProps<
    typeof PlaceholderInput
  >['selectionType'];
  suggestionsOptions?: React.ComponentProps<
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

export const CreateTicketActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TTicketActionConfigForm>) => {
  const propertyType = targetType || TICKET_PROPERTY_TYPE;
  const form = useForm<TTicketActionConfigForm>({
    resolver: zodResolver(ticketActionConfigFormSchema),
    defaultValues: {
      ...(currentAction?.config || {}),
    },
  });
  const { control, handleSubmit, setValue } = form;
  const [channelId, pipelineId] = useWatch({
    control,
    name: ['channelId', 'pipelineId'],
  });

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
      <div className="grid grid-cols-3 gap-2">
        <Form.Field
          control={control}
          name="channelId"
          render={({ field }) => (
            <Form.Item className={FULL_WIDTH_SELECT_ITEM_CLASS}>
              <Form.Label>Channel</Form.Label>
              <SelectChannel.FormItem
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('pipelineId', '');
                  setValue('statusId', '');
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="pipelineId"
          render={({ field }) => (
            <Form.Item className={FULL_WIDTH_SELECT_ITEM_CLASS}>
              <Form.Label>Pipeline</Form.Label>
              <SelectPipeline
                variant="form"
                value={field.value || ''}
                channelId={channelId}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('statusId', '');
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="statusId"
          render={({ field }) => (
            <Form.Item className={FULL_WIDTH_SELECT_ITEM_CLASS}>
              <Form.Label>Status</Form.Label>
              <TicketStatusConfigSelect
                value={field.value || ''}
                pipelineId={pipelineId}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

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

      <div className="grid grid-cols-2 gap-2">
        <PlaceholderFormField
          control={control}
          name="priority"
          label="Priority"
          propertyType={propertyType}
          enabled={{
            option: true,
          }}
          selectionType="option"
          suggestionsOptions={{
            option: {
              options: PROJECT_PRIORITIES_OPTIONS.map((label, value) => ({
                label,
                value: String(value),
              })),
            },
          }}
        />
        <PlaceholderFormField
          control={control}
          name="assigneeId"
          label="Assignee"
          propertyType={propertyType}
          enabled={{
            call_user: true,
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PlaceholderFormField
          control={control}
          name="startDate"
          label="Start date"
          propertyType={propertyType}
          enabled={{
            date: true,
          }}
        />
        <PlaceholderFormField
          control={control}
          name="targetDate"
          label="Target date"
          propertyType={propertyType}
          enabled={{
            date: true,
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <PlaceholderFormField
          control={control}
          name="tagIds"
          label="Tags"
          propertyType={propertyType}
          selectMode="many"
        />
        <PlaceholderFormField
          control={control}
          name="labelIds"
          label="Labels"
          propertyType={propertyType}
          selectMode="many"
        />
        <PlaceholderFormField
          control={control}
          name="companyIds"
          label="Companies"
          propertyType={propertyType}
          selectMode="many"
          enabled={{
            call_company: true,
          }}
        />
      </div>
    </Form>
  );
};
