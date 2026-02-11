import { z } from 'zod';

export const propertyGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  code: z.string().optional(),
});

export const optionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
});

export const logicSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.string(),
  action: z.string(),
});

export const propertySchema = z
  .object({
    icon: z.string().min(1, 'Icon is required'),
    name: z.string().min(1, 'Property name is required'),
    description: z.string().optional(),
    code: z.string().min(1, 'Code is required'),
    type: z.string().min(1, 'Type is required'),
    relationType: z.string().optional(),
    validation: z.string().optional(),
    isSearchable: z.boolean().default(false),
    logics: z.array(logicSchema).nullable().optional(),
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
                message: 'Value must be unique',
                path: [index, 'value'],
              });
            }
          });
        }
      }),
  })
  .refine(
    (data) =>
      data.type !== 'relation' ||
      (data.relationType && data.relationType.trim().length > 0),
    {
      path: ['relationType'],
      message: 'Relation type is required',
    },
  );
