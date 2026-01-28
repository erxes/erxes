import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Textarea } from 'erxes-ui';
import { SelectCategory } from '@/pricing/components/SelectCategory';
import { SelectProduct, SelectTags } from 'ui-modules';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

interface LoyaltyScoreAddCoreFieldsProps {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}

export const LoyaltyScoreAddCoreFields: React.FC<
  LoyaltyScoreAddCoreFieldsProps
> = ({ form }) => {
  return (
    <div className="flex flex-col gap-5">
      <Form.Field
        control={form.control}
        name="title"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Title</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Enter title" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Description</Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                placeholder="Enter description"
                className="min-h-[80px]"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Form.Field
            control={form.control}
            name="conditions.productCategoryIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Product Category</Form.Label>
                <Form.Control>
                  <SelectCategory
                    mode="multiple"
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value : [value])
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="conditions.productIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Product</Form.Label>
                <Form.Control>
                  <SelectProduct
                    mode="multiple"
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value : [value])
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="conditions.tagIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Tag</Form.Label>
                <Form.Control>
                  <SelectTags
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value : [])
                    }
                    tagType="tags"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Form.Field
            control={form.control}
            name="conditions.excludeProductCategoryIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Or Exclude Product Category</Form.Label>
                <Form.Control>
                  <SelectCategory
                    mode="multiple"
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value : [value])
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="conditions.excludeProductIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Or Exclude Product</Form.Label>
                <Form.Control>
                  <SelectProduct
                    mode="multiple"
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value : [value])
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="conditions.excludeTagIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Or Exclude Tag</Form.Label>
                <Form.Control>
                  <SelectTags
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value : [])
                    }
                    tagType="tags"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
};
