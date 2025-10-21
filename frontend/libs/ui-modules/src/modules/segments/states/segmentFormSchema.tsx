import { z } from 'zod';

const checkPropertValue = (val: any) => {
  const isArrayEmpty = val && Array.isArray(val) && !val?.length;
  const isValueEmpty = !val;

  return isArrayEmpty || isValueEmpty;
};

export const conditionsSchema = z.array(
  z
    .object({
      propertyType: z
        .string({ required_error: 'Property type is required' })
        .min(1, 'Property type is required'),
      propertyName: z
        .string({
          required_error: 'Property name is required',
          invalid_type_error: 'Property name must be a provided',
        })
        .min(1, 'Property name is required'),
      propertyOperator: z
        .string({
          required_error: 'Property operator is required',
          invalid_type_error: 'Property operator must be a provided',
        })
        .min(1, 'Property operator is required'),
      propertyValue: z.any().optional(),
    })
    .superRefine((data, ctx) => {
      const optionalOperators = ['is', 'ins', 'it', 'if'];
      if (!optionalOperators.includes(data?.propertyOperator)) {
        if (checkPropertValue(data.propertyValue)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['propertyValue'],
            message: 'Property value is required',
          });
        }
      }
    }),
);

export const segmentFormSchema = z.object({
  name: z.string(),
  subOf: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  config: z.record(z.any()),
  conditionSegments: z
    .array(
      z.object({
        contentType: z.string(),
        conditionsConjunction: z.enum(['and', 'or']),
        conditions: conditionsSchema.optional(),
      }),
    )
    .optional(),
  conditions: conditionsSchema.optional(),
  conditionsConjunction: z.enum(['and', 'or']),
});
