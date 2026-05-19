import { z } from 'zod';
import { FieldDefinition } from '../posts/CustomFieldInput';

// Base schema without custom fields
export const baseCategoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  status: z.enum(['active', 'inactive']).default('active'),
  parentId: z.string().optional(),
  customFieldsData: z
    .array(
      z.object({
        field: z.string(),
        value: z.any().optional(),
      }),
    )
    .default([]),
});

const isEmptyRequiredValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

// Function to create dynamic schema with custom fields validation
export const createCategoryFormSchema = (fields: FieldDefinition[]) => {
  const requiredFields = fields.filter((field) => field.isRequired);

  if (requiredFields.length === 0) {
    return baseCategoryFormSchema;
  }

  const customFieldsDataSchema = z
    .array(
      z.object({
        field: z.string(),
        value: z.any().optional(),
      }),
    )
    .default([])
    .superRefine((data, ctx) => {
      for (const field of requiredFields) {
        const value = data.find((item) => item.field === field._id)?.value;

        if (isEmptyRequiredValue(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.label} is required`,
            path: [field._id],
          });
        }
      }
    });

  return baseCategoryFormSchema.extend({
    customFieldsData: customFieldsDataSchema,
  });
};

export type DynamicCategoryFormType = z.infer<
  ReturnType<typeof createCategoryFormSchema>
>;

export type CategoryFormType = z.infer<typeof baseCategoryFormSchema> & {
  [key: `customFields.${string}`]:
    | string
    | boolean
    | string[]
    | null
    | undefined;
};
