import { useTranslation } from 'react-i18next';
import { Form, Select } from 'erxes-ui';
import { ITransactionGroupForm } from '../../types/JournalForms';
import {
  CustomerType,
  SelectCompany,
  SelectCustomer,
  SelectMember,
} from 'ui-modules';

const CUSTOMER_TYPE_LABELS = {
  [CustomerType.CUSTOMER]: 'contact',
  [CustomerType.COMPANY]: 'organization-3',
  [CustomerType.USER]: 'employee',
};

export const CustomerFields = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const { t } = useTranslation('accounting');

  const { customerType } = form.watch(`trDocs.${index}`);

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
        name={`trDocs.${index}.customerType`}
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
                    {t(CUSTOMER_TYPE_LABELS[type])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={`trDocs.${index}.customerId`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t(CUSTOMER_TYPE_LABELS[customerType as CustomerType]) ||
                t('contact')}
            </Form.Label>
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
