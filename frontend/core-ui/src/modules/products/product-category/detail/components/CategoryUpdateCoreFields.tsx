import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { SelectCategory } from '../../components/SelectCategory';
import { ProductFormValues } from '../../add-category/components/formSchema';
import { ACCOUNT_CATEGORY_MASK_TYPES } from '../../add-category/components/CategoryAddMoreFields';

interface CategoryDetail extends ProductFormValues {
  _id: string;
}

interface CategoriesUpdateCoreFieldsProps {
  form: UseFormReturn<ProductFormValues>;
  categoryDetail?: CategoryDetail;
}

export const CategoriesUpdateCoreFields: React.FC<
  CategoriesUpdateCoreFieldsProps
> = ({ form, categoryDetail }) => {
  useEffect(() => {
    if (categoryDetail) {
      form.reset({
        code: categoryDetail.code,
        name: categoryDetail.name,
        parentId: categoryDetail.parentId || '',
      });
    }
  }, [categoryDetail, form]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  NAME <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="Enter name" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <div className="flex-1">
          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  CODE <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="Enter code" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </div>

      <Form.Field
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Parent Category</Form.Label>
            <Form.Control>
              <SelectCategory
                selected={field.value}
                onSelect={(val) => field.onChange(val || '')}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="maskType"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Mask Type</Form.Label>
            <Select onValueChange={field.onChange} value={field.value}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Choose type">
                    {
                      ACCOUNT_CATEGORY_MASK_TYPES.find(
                        (type) => type.value === field.value,
                      )?.label
                    }
                  </Select.Value>
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {ACCOUNT_CATEGORY_MASK_TYPES.map((type) => (
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
