import { z } from 'zod';

// A code is derived from Latin letters and digits only, so a name without any leaves it empty.
const hasCode = (data: { code: string }) => data.code.length > 0;

const CODE_REQUIRED = {
  path: ['code'],
  message: 'Code is required when the name has no Latin letters or digits',
};

export const propertyGroupSchema = z
  .object({
    name: z.string().min(1, 'Group name is required'),
    code: z.string().optional(),
    isMultiple: z
      .boolean()
      .nullable()
      .optional()
      .transform((v) => v ?? false),
  })
  .transform((data) => ({
    ...data,
    code:
      data.code?.trim() ||
      data.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
  }))
  .refine(hasCode, CODE_REQUIRED);

export const optionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  deprecated: z.boolean().nullable().optional(),
});

export const objectListConfigSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['text', 'textarea']),
});

export const logicSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.string(),
  action: z.string(),
});

export const propertySchema = z
  .object({
    icon: z.string().default('123'),
    name: z.string().min(1, 'Property name is required'),
    description: z.string().optional(),
    code: z.string().optional(),
    groupId: z.string().min(1, 'Group is required'),
    type: z.string().min(1, 'Type is required'),
    relationType: z.string().optional(),
    validations: z
      .object({
        number: z.boolean().optional(),
        email: z.boolean().optional(),
        date: z.boolean().optional(),
      })
      .nullable()
      .optional(),
    isSearchable: z.boolean().default(false),
    isVisible: z
      .boolean()
      .nullable()
      .optional()
      .transform((v) => v ?? true),
    isVisibleToCreate: z
      .boolean()
      .nullable()
      .optional()
      .transform((v) => v ?? false),
    isRequired: z
      .boolean()
      .nullable()
      .optional()
      .transform((v) => v ?? false),
    isVisibleInCard: z
      .boolean()
      .nullable()
      .optional()
      .transform((v) => v ?? false),
    logics: z.array(logicSchema).nullable().optional(),
    configs: z
      .object({ objectListConfigs: z.array(objectListConfigSchema).optional() })
      .nullable()
      .optional(),
    objectListConfigs: z
      .array(objectListConfigSchema)
      .optional()
      .superRefine((configs, ctx) => {
        if (!configs || configs.length === 0) return;

        const keys = configs.map((config) => config.key.trim().toLowerCase());
        const keySet = new Set(keys);

        if (keys.length !== keySet.size) {
          keys.forEach((key, index) => {
            const firstIndex = keys.indexOf(key);

            if (firstIndex !== index && key) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Key must be unique',
                path: [index, 'key'],
              });
            }
          });
        }
      }),
    options: z
      .array(optionSchema)
      .optional()
      .superRefine((options, ctx) => {
        if (!options || options.length === 0) return;

        const values = options.map((opt) => opt.value.trim().toLowerCase());
        const valueSet = new Set(values);

        if (values.length !== valueSet.size) {
          values.forEach((value, index) => {
            const firstIndex = values.indexOf(value);

            if (firstIndex !== index && value) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                // Reusing an archived value would relabel the records holding it.
                message: options[firstIndex].deprecated
                  ? 'An archived option uses this value: restore it and rename its label instead'
                  : 'Value must be unique',
                path: [index, 'value'],
              });
            }
          });
        }
      }),
  })
  .transform((data) => ({
    ...data,
    code:
      data.code?.trim() ||
      data.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
  }))
  .refine(hasCode, CODE_REQUIRED)
  .refine(
    (data) =>
      data.type !== 'relation' ||
      (data.relationType && data.relationType.trim().length > 0),
    {
      path: ['relationType'],
      message: 'Relation type is required',
    },
  )
  .refine(
    (data) =>
      data.type !== 'objectList' ||
      (data.objectListConfigs && data.objectListConfigs.length > 0),
    {
      path: ['objectListConfigs'],
      message: 'At least one field is required',
    },
  );
