import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { SelectCategory } from '../../components/SelectCategory';
import { useProductCategoryDetail } from '../hooks/useCategoryDetail';
import { ProductFormValues } from '../../add-category/components/formSchema';

interface CategoriesUpdateCoreFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

export const CategoriesUpdateCoreFields: React.FC<
  CategoriesUpdateCoreFieldsProps
> = ({ form }) => {
  const { categoryDetail, loading, error } = useProductCategoryDetail();

  useEffect(() => {
    if (categoryDetail) {
      form.reset({
        code: categoryDetail.code,
        name: categoryDetail.name,
        categoryId: categoryDetail._id,
      });
    }
  }, [categoryDetail, form]);

  if (loading) return <div>Loading category...</div>;
  if (error) return <div>Error loading category</div>;

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
              <Input {...field} placeholder="Enter code" />
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
              <Input {...field} placeholder="Enter name" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
