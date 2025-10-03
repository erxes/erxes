import { UseFormReturn } from 'react-hook-form';
import {
  IconDeviceUnknown,
  IconHotelService,
  IconPackage,
  IconStar,
} from '@tabler/icons-react';

import { Form, Input, Select, CurrencyField } from 'erxes-ui';
import { ProductFormValues } from './formSchema';
import { useUom } from '@/products/hooks/useUom';
import { SelectCategory } from 'ui-modules';

const types = [
  { label: 'Product', value: 'product', icon: IconPackage },
  { label: 'Service', value: 'service', icon: IconHotelService },
  { label: 'Unique', value: 'unique', icon: IconStar },
  { label: 'Subscription', value: 'subscription', icon: IconDeviceUnknown },
];

export const ProductAddCoreFields = ({
  form,
}: {
  form: UseFormReturn<ProductFormValues>;
}) => {
  const { uoms } = useUom({});
  return (
    <div className="grid grid-cols-2 gap-5 ">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>NAME</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="code"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>CODE</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="uom"
        render={({ field }) => (
          <Form.Item className="flex flex-col">
            <Form.Label>UNIT OF MEASUREMENTS</Form.Label>
            <Select onValueChange={field.onChange} value={field.value}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder={'Choose UOM'}>
                    <span>
                      {uoms.find((uom: any) => uom._id === field.value)?.name}
                    </span>
                  </Select.Value>
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {uoms.map((uom: any) => (
                  <Select.Item key={uom._id} value={uom._id}>
                    {uom.name}
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
        name="unitPrice"
        render={({ field }) => (
          <Form.Item className="flex flex-col">
            <Form.Label>UNIT PRICE</Form.Label>
            <Form.Control>
              <CurrencyField.ValueInput
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            </Form.Control>

            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>CATEGORY</Form.Label>
            <Form.Control>
              <SelectCategory
                selected={field.value}
                onSelect={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="shortName"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>SHORT NAME</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="type"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>TYPE</Form.Label>
            <Select onValueChange={field.onChange} value={field.value}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Choose type">
                    {types.find((type) => type.value === field.value)?.label}
                  </Select.Value>
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {types.map((type) => (
                  <Select.Item key={type.value} value={type.value}>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
