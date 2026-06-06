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
        value: z.unknown().optional(),
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

const isValidByFieldType = (value: unknown, type: string): boolean => {
  switch (type) {
    case 'checkbox':
    case 'boolean':
      return typeof value === 'boolean';
    case 'multiSelect':
    case 'file':
      return Array.isArray(value) && value.every((v) => typeof v === 'string');
    case 'number':
      return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
    default:
      return typeof value === 'string';
  }
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
        value: z.unknown().optional(),
      }),
    )
    .default([])
    .superRefine((data, ctx) => {
      for (const field of requiredFields) {
        const item = data.find((item) => item.field === field._id);
        const value = item?.value;

        if (isEmptyRequiredValue(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.label} is required`,
            path: [field._id],
          });
        } else if (!isValidByFieldType(value, field.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.label} has an invalid format`,
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
