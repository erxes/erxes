import { SelectPos } from '@/pos/orders/components/selects/SelectPos';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useForm, useWatch } from 'react-hook-form';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  POS_ORDER_EVENT_OPTIONS,
  POS_ORDER_STATUS_OPTIONS,
  POS_ORDER_TYPE_OPTIONS,
} from '../../constants/configForm';
import {
  posOrderEventTriggerConfigFormSchema,
  TPosOrderEventTriggerConfigForm,
} from '../../states/posOrderEventTriggerConfigFormDefinitions';
import { PosOptionInput } from '../common/PosOptionInput';
import { PosPaymentTypeSelect } from '../common/PosPaymentTypeSelect';

export const PosOrderEventTriggerConfigForm = ({
  formRef,
  onSaveTriggerConfig,
  activeTrigger,
}: AutomationTriggerFormProps<TPosOrderEventTriggerConfigForm>) => {
  const form = useForm<TPosOrderEventTriggerConfigForm>({
    resolver: zodResolver(posOrderEventTriggerConfigFormSchema),
    defaultValues: {
      eventType: 'paid',
      ...(activeTrigger?.config || {}),
    },
  });
  const { control, handleSubmit } = form;
  const [eventType, posId] = useWatch({
    control,
    name: ['eventType', 'posId'],
  });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'POS Order Event Trigger Configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveTriggerConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <div className="grid grid-cols-2 gap-2">
        <Form.Field
          control={control}
          name="posId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>POS</Form.Label>
              <SelectPos.FormItem
                mode="single"
                value={field.value || ''}
                onValueChange={(value) =>
                  field.onChange(typeof value === 'string' ? value : '')
                }
                placeholder="Any POS"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="eventType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Event</Form.Label>
              <PosOptionInput
                value={field.value}
                onChange={field.onChange}
                options={POS_ORDER_EVENT_OPTIONS}
                placeholder="Select event"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      {eventType === 'statusChanged' && (
        <div className="grid grid-cols-2 gap-2">
          <Form.Field
            control={control}
            name="fromStatus"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>From status</Form.Label>
                <PosOptionInput
                  value={field.value}
                  onChange={field.onChange}
                  options={POS_ORDER_STATUS_OPTIONS}
                  placeholder="Any status"
                  allowEmpty
                  emptyLabel="Any status"
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="toStatus"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>To status</Form.Label>
                <PosOptionInput
                  value={field.value}
                  onChange={field.onChange}
                  options={POS_ORDER_STATUS_OPTIONS}
                  placeholder="Any status"
                  allowEmpty
                  emptyLabel="Any status"
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Form.Field
          control={control}
          name="orderType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Order type</Form.Label>
              <PosOptionInput
                value={field.value}
                onChange={field.onChange}
                options={POS_ORDER_TYPE_OPTIONS}
                placeholder="Any order type"
                allowEmpty
                emptyLabel="Any order type"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="paymentType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Payment type</Form.Label>
              <PosPaymentTypeSelect
                posId={posId}
                value={field.value || ''}
                onChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
