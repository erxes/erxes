import { z } from 'zod';

const splitConditionSchema = z
  .object({
    propertyType: z.string().min(1, 'Property type is required'),
    propertyName: z.string().min(1, 'Property name is required'),
    propertyOperator: z.string().min(1, 'Property operator is required'),
    propertyValue: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    const optionalOperators = ['is', 'ins', 'it', 'if', 'dateis', 'dateins'];

    if (optionalOperators.includes(data.propertyOperator)) {
      return;
    }

    const isEmptyArray =
      Array.isArray(data.propertyValue) && !data.propertyValue.length;
    const isEmptyValue =
      data.propertyValue === undefined ||
      data.propertyValue === null ||
      data.propertyValue === '';

    if (isEmptyArray || isEmptyValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['propertyValue'],
        message: 'Property value is required',
      });
    }
  });

export const splitConditionsConfigFormSchema = z.object({
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1, 'Option label is required'),
        segmentId: z.string().optional(),
        config: z
          .object({
            conditionsConjunction: z.enum(['and', 'or']).default('and'),
            conditions: z.array(splitConditionSchema).optional(),
          })
          .optional(),
      }),
    )
    .min(1, 'At least one option is required'),
});

export type TSplitConditionsConfigForm = z.infer<
  typeof splitConditionsConfigFormSchema
>;
