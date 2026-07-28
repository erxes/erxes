import { SelectPos } from '@/pos/orders/components/selects/SelectPos';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('sales');
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
              <Form.Label>{t('pos')}</Form.Label>
              <SelectPos.FormItem
                mode="single"
                value={field.value || ''}
                onValueChange={(value) =>
                  field.onChange(typeof value === 'string' ? value : '')
                }
                placeholder={t('any-pos')}
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
              <Form.Label>{t('event')}</Form.Label>
              <PosOptionInput
                value={field.value}
                onChange={field.onChange}
                options={POS_ORDER_EVENT_OPTIONS}
                placeholder={t('select-event')}
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
                <Form.Label>{t('from-status')}</Form.Label>
                <PosOptionInput
                  value={field.value}
                  onChange={field.onChange}
                  options={POS_ORDER_STATUS_OPTIONS}
                  placeholder={t('any-status')}
                  allowEmpty
                  emptyLabel={t('any-status')}
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
                <Form.Label>{t('to-status')}</Form.Label>
                <PosOptionInput
                  value={field.value}
                  onChange={field.onChange}
                  options={POS_ORDER_STATUS_OPTIONS}
                  placeholder={t('any-status')}
                  allowEmpty
                  emptyLabel={t('any-status')}
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
              <Form.Label>{t('order-type')}</Form.Label>
              <PosOptionInput
                value={field.value}
                onChange={field.onChange}
                options={POS_ORDER_TYPE_OPTIONS}
                placeholder={t('any-order-type')}
                allowEmpty
                emptyLabel={t('any-order-type')}
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
              <Form.Label>{t('payment-type')}</Form.Label>
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
