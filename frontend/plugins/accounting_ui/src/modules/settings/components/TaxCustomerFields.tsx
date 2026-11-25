import { Button, Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UseFormReturn, useWatch } from 'react-hook-form';
import {
  CustomerType,
  SelectCompany,
  SelectCustomer,
  SelectMember,
} from 'ui-modules';
import { TMainSettings } from '../constants/mainSettingsSchema';

const customerTypeLabels = {
  [CustomerType.CUSTOMER]: 'contact',
  [CustomerType.COMPANY]: 'organization',
  [CustomerType.USER]: 'employee',
} as const;

const customerSelects = {
  [CustomerType.CUSTOMER]: SelectCustomer.FormItem,
  [CustomerType.COMPANY]: SelectCompany,
  [CustomerType.USER]: SelectMember.FormItem,
};

export const TaxCustomerFields = ({
  form,
  name,
}: {
  form: UseFormReturn<TMainSettings>;
  name: 'VatCustomer' | 'CtaxCustomer';
}) => {
  const { t } = useTranslation('accounting');
  const customerType =
    useWatch({ control: form.control, name: `${name}.customerType` }) ??
    CustomerType.CUSTOMER;
  const SelectContact = customerSelects[customerType];

  return (
    <div className="grid grid-cols-1 gap-5 sm:col-span-2 sm:grid-cols-2">
      <Form.Field
        control={form.control}
        name={`${name}.customerType`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('customer-type')}</Form.Label>
            <Select
              value={customerType}
              onValueChange={(value) => {
                const type = Object.values(CustomerType).find(
                  (option) => option === value,
                );
                if (type && type !== customerType) {
                  field.onChange(type);
                  form.setValue(`${name}.customerId`, '', {
                    shouldDirty: true,
                  });
                }
              }}
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {Object.values(CustomerType).map((type) => (
                  <Select.Item key={type} value={type}>
                    {t(customerTypeLabels[type])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={`${name}.customerId`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('contact')}</Form.Label>
            <div className="flex items-center gap-2">
              <Form.Control>
                <SelectContact
                  key={`${customerType}:${field.value ?? ''}`}
                  mode="single"
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  className="min-w-0 flex-1"
                />
              </Form.Control>
              {field.value && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => field.onChange('')}
                >
                  {t('clear')}
                </Button>
              )}
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
