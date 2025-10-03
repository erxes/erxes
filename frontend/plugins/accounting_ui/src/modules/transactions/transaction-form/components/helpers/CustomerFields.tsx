import { Form, Select } from 'erxes-ui';
import { ITransactionGroupForm } from '../../types/JournalForms';
import {
  CustomerType,
  SelectCustomer,
  SelectCompany,
  SelectMember,
} from 'ui-modules';

export const CustomerFields = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
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
            <Form.Label>Customer Type</Form.Label>

            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Select Customer Type" />
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
        name={`trDocs.${index}.customerId`}
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
