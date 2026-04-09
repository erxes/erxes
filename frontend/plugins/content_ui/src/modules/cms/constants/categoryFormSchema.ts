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

// Function to create dynamic schema with custom fields validation
export const createCategoryFormSchema = (fields: FieldDefinition[]) => {
  const customFieldValidations: Record<string, z.ZodTypeAny> = {};

  // Add validation for each custom field (both required and optional)
  fields.forEach((field) => {
    const fieldName = `customFields.${field._id}`;

    // Create validation based on field type
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'textarea':
      case 'number':
      case 'select':
      case 'radio':
      case 'date':
        customFieldValidations[fieldName] = field.isRequired
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
        break;
      case 'multiSelect':
        customFieldValidations[fieldName] = field.isRequired
          ? z.array(z.string()).min(1, `${field.label} is required`)
          : z.array(z.string()).optional();
        break;
      case 'checkbox':
      case 'boolean':
        customFieldValidations[fieldName] = z.boolean().optional();
        break;
      default:
        customFieldValidations[fieldName] = field.isRequired
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
    }
  });

  return baseCategoryFormSchema.extend(customFieldValidations);
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
