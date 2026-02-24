import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { SelectCategory } from '../../components/SelectCategory';
import { ProductFormValues } from './formSchema';

interface ProductCategoriesAddCoreFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

export const ProductCategoriesAddCoreFields: React.FC<
  ProductCategoriesAddCoreFieldsProps
> = ({ form }) => {
  return (
    <div className="flex flex-col gap-5">
      <Form.Field
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Parent Category</Form.Label>
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
    </div>
  );
};
