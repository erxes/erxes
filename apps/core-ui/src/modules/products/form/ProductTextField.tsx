import { Form, Input } from 'erxes-ui';
import type { ComponentProps, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ProductFormValues } from './productFormValues';

type TextKey =
  | 'name'
  | 'code'
  | 'barcode'
  | 'unit'
  | 'price'
  | 'weightGrams'
  | 'lengthMm'
  | 'widthMm'
  | 'heightMm';

/** One text input of the product form, with its label and message (`after` under the message). */
export const ProductTextField = ({
  name,
  label,
  after,
  ...input
}: {
  name: TextKey;
  label: string;
  after?: ReactNode;
} & Omit<ComponentProps<typeof Input>, 'name' | 'value' | 'onChange' | 'onBlur'>) => {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <Input {...input} {...field} />
          </Form.Control>
          <Form.Message />
          {after}
        </Form.Item>
      )}
    />
  );
};
