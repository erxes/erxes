import { FieldType, FieldValidation } from '@erxes/core-contract';
import { z } from 'zod';
import { hasOptions } from './fieldTypes';

// A code is derived from Latin letters and digits only, so a name without any leaves it empty.
const hasCode = (data: { code: string }) => data.code.length > 0;

const CODE_REQUIRED = {
  path: ['code'],
  message: 'Code is required when the name has no Latin letters or digits',
};

export const codeOf = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const CODE = /^[A-Za-z0-9_.-]*$/;

export const propertyGroupSchema = z
  .object({
    name: z.string().trim().min(1, 'Group name is required').max(100),
    code: z.string().trim().max(100).regex(CODE, 'Only letters, digits, _ . -').optional(),
    description: z.string().max(1000).optional(),
  })
  .transform((data) => ({ ...data, code: data.code?.trim() || codeOf(data.name) }))
  .refine(hasCode, CODE_REQUIRED);

export const propertySchema = z
  .object({
    icon: z.string().default(''),
    name: z.string().trim().min(1, 'Property name is required').max(100),
    description: z.string().max(1000).optional(),
    code: z.string().trim().max(100).regex(CODE, 'Only letters, digits, _ . -').optional(),
    groupId: z.string().min(1, 'Group is required'),
    type: FieldType,
    validation: FieldValidation.nullable().optional(),
    isVisible: z.boolean().default(true),
    options: z
      .array(z.object({ value: z.string().trim().min(1, 'Label is required').max(200) }))
      .optional()
      .superRefine((options, ctx) => {
        if (!options || options.length === 0) return;

        const values = options.map((option) => option.value.trim().toLowerCase());

        values.forEach((value, index) => {
          if (value && values.indexOf(value) !== index) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Value must be unique',
              path: [index, 'value'],
            });
          }
        });
      }),
  })
  .transform((data) => ({ ...data, code: data.code?.trim() || codeOf(data.name) }))
  .refine(hasCode, CODE_REQUIRED)
  .refine((data) => !hasOptions(data.type) || (data.options?.length ?? 0) > 0, {
    path: ['options'],
    message: 'Add at least one option',
  });

export type IPropertyGroupForm = z.input<typeof propertyGroupSchema>;
export type IPropertyGroupValues = z.output<typeof propertyGroupSchema>;
export type IPropertyForm = z.input<typeof propertySchema>;
export type IPropertyValues = z.output<typeof propertySchema>;
