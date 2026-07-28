import { Form, Select } from 'erxes-ui';
import {
  CustomerType,
  SelectCustomer,
  SelectCompany,
  SelectMember,
} from 'ui-modules';
import { TSafeRemainderEditForm } from '../types/safeRemainderForm';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const CustomerFields = ({
  form,
  kind,
}: {
  form: UseFormReturn<TSafeRemainderEditForm>;
  kind: 'incomeRule' | 'outRule' | 'saleRule';
}) => {
  const { t } = useTranslation('accounting');
  const { customerType } = form.watch(`${kind}`);

  const SelectComponent =
    customerType === CustomerType.CUSTOMER
      ? SelectCustomer.FormItem
      : customerType === CustomerType.COMPANY
      ? SelectCompany
      : SelectMember.FormItem;

  return (
    <>
      <Form.Field
        control={form.control}
        name={`${kind}.customerType`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('customer-type')}</Form.Label>

            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder={t('select-customer-type')} />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {Object.values(CustomerType).map((type) => (
                  <Select.Item key={type} value={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={`${kind}.customerId`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{customerType}</Form.Label>
            <Form.Control>
              <SelectComponent
                value={field.value ?? ''}
                onValueChange={field.onChange}
                mode={'single'}
                className="flex"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
