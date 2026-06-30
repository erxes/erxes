import { SelectPos } from '@/pos/orders/components/selects/SelectPos';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { Control, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  POS_CUSTOMER_TYPE_OPTIONS,
  POS_ORDER_STATUS_OPTIONS,
  POS_ORDER_TYPE_OPTIONS,
} from '../../constants/configForm';
import {
  posOrderActionConfigFormSchema,
  TPosOrderActionConfigForm,
} from '../../states/posOrderActionConfigFormDefinitions';
import { PosOptionInput } from '../common/PosOptionInput';

type TActionFieldName = keyof TPosOrderActionConfigForm;
const POS_ORDER_PROPERTY_TYPE = 'sales:pos.orders';

const PosOptionFormField = ({
  control,
  name,
  label,
  options,
}: {
  control: Control<TPosOrderActionConfigForm>;
  name: TActionFieldName;
  label: string;
  options: Array<{ value: string; label: string }>;
}) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <PosOptionInput
          value={field.value as string | undefined}
          onChange={field.onChange}
          options={options}
          placeholder={label}
        />
        <Form.Message />
      </Form.Item>
    )}
  />
);

const CustomerField = ({
  control,
  customerType,
  propertyType,
  t,
}: {
  control: Control<TPosOrderActionConfigForm>;
  customerType?: string;
  propertyType: string;
  t: (key: string) => string;
}) => (
  <Form.Field
    control={control}
    name="customerId"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{t('customer')}</Form.Label>
        <PlaceholderInput
          propertyType={propertyType}
          value={field.value || ''}
          onChange={field.onChange}
          placeholderConfig={{
            selectMode: 'one',
            allowOnlyTriggers: true,
          }}
          enabled={[
            customerType === 'company'
              ? TPlaceholderInputSuggestion.CallCompany
              : customerType === 'user'
                ? TPlaceholderInputSuggestion.CallUser
                : TPlaceholderInputSuggestion.CallCustomer,
          ]}
        />
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const CreatePosOrderActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TPosOrderActionConfigForm>) => {
  const { t } = useTranslation('sales');
  const propertyType = targetType || POS_ORDER_PROPERTY_TYPE;
  const form = useForm<TPosOrderActionConfigForm>({
    resolver: zodResolver(posOrderActionConfigFormSchema),
    defaultValues: {
      status: 'new',
      type: 'take',
      customerType: 'customer',
      ...(currentAction?.config || {}),
    },
  });
  const { control, handleSubmit } = form;
  const customerType = useWatch({
    control,
    name: 'customerType',
  });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Create POS Order Action Configuration',
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
                placeholder={t('select-pos')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <PosOptionFormField
          control={control}
          name="status"
          label={t('status')}
          options={POS_ORDER_STATUS_OPTIONS}
        />
        <PosOptionFormField
          control={control}
          name="type"
          label={t('order-type')}
          options={POS_ORDER_TYPE_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PosOptionFormField
          control={control}
          name="customerType"
          label={t('customer-type')}
          options={POS_CUSTOMER_TYPE_OPTIONS}
        />
        <CustomerField
          control={control}
          customerType={customerType}
          propertyType={propertyType}
          t={t}
        />
      </div>

      <Form.Field
        control={control}
        name="productIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('products')}</Form.Label>
            <PlaceholderInput
              propertyType={propertyType}
              value={field.value || ''}
              onChange={field.onChange}
              placeholderConfig={{
                selectMode: 'many',
                delimiter: ',',
                allowOnlyTriggers: true,
              }}
              enabled={[TPlaceholderInputSuggestion.CallProduct]}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </Form>
  );
};
