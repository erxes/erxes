import { UseFormReturn } from 'react-hook-form';

import { IconUpload } from '@tabler/icons-react';

import { Form, Input, Upload, Editor, Select } from 'erxes-ui';

import { SelectBrand } from 'ui-modules';
import { ProductFormValues } from './formSchema';
import { CategoryHotKeyScope } from '../../types/CategoryHotKeyScope';

export const ACCOUNT_CATEGORY_MASK_TYPES = [
  { label: 'Any', value: 'any' },
  { label: 'Soft', value: 'soft' },
  { label: 'Hard', value: 'hard' },
  { label: 'All', value: 'all' },
];

export const PRODUCT_CATEGORIES_STATUS = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Archived', value: 'archived' },
];

export const ProductCategoryAddMoreFields = ({
  form,
}: {
  form: UseFormReturn<ProductFormValues>;
}) => {
  return (
    <>
      <div className="flex items-center my-4">
        <div className="flex-1 border-t" />
        <Form.Label className="mx-2">More Info</Form.Label>
        <div className="flex-1 border-t" />
      </div>
      <Form.Field
        control={form.control}
        name="meta"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>META</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="scopeBrandIds"
        render={({ field }) => (
          <Form.Item className="flex flex-col mb-5">
            <Form.Label>BRAND</Form.Label>
            <Form.Control>
              <SelectBrand
                value={field.value?.[0] || ''}
                onValueChange={(brandId) => {
                  field.onChange([brandId]);
                }}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>DESCRIPTION</Form.Label>
            <Form.Control>
              <Editor
                initialContent={field.value}
                onChange={field.onChange}
                scope={CategoryHotKeyScope.CategoryAddSheetDescriptionField}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="attachment"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>UPLOAD</Form.Label>
            <Form.Control>
              <Upload.Root {...field}>
                <Upload.Preview className="hidden" />
                <Upload.Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  className="w-full h-20 flex flex-col items-center justify-center border border-dashed text-muted-foreground"
                >
                  <IconUpload />
                  <span className="font-medium text-sm">Primary upload</span>
                </Upload.Button>
              </Upload.Root>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="accountMaskType"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>MASK TYPE</Form.Label>
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
      <Form.Field
        control={form.control}
        name="state"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>State</Form.Label>
            <Select onValueChange={field.onChange} value={field.value}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Choose type">
                    {
                      PRODUCT_CATEGORIES_STATUS.find(
                        (type) => type.value === field.value,
                      )?.label
                    }
                  </Select.Value>
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {PRODUCT_CATEGORIES_STATUS.map((type) => (
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
    </>
  );
};
