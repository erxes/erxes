import { AUTOMATION_UNARY_OPERATORS } from 'ui-modules';
import { z } from 'zod';

const formFieldConditionSchema = z
  .object({
    fieldId: z.string().min(1, 'Pick a field'),
    operator: z.string().min(1, 'Pick an operator'),
    value: z.string().optional(),
  })
  .superRefine((condition, ctx) => {
    if (
      !AUTOMATION_UNARY_OPERATORS.includes(condition.operator) &&
      !condition.value?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Enter a value',
      });
    }
  });

export const formSubmittedTriggerFormSchema = z.object({
  channelId: z.string().optional(),
  formId: z.string().min(1, 'Select a form'),
  conjunction: z.enum(['and', 'or']),
  conditions: z.array(formFieldConditionSchema),
});

export type TFormSubmittedTriggerForm = z.infer<
  typeof formSubmittedTriggerFormSchema
>;

export type TFormFieldCondition = TFormSubmittedTriggerForm['conditions'][number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toText = (value: unknown) => (typeof value === 'string' ? value : '');

export const readFormSubmittedTriggerConfig = (
  config: unknown,
): TFormSubmittedTriggerForm => {
  const value = isRecord(config) ? config : {};

  return {
    channelId: toText(value.channelId) || undefined,
    formId: toText(value.formId),
    conjunction: value.conjunction === 'or' ? 'or' : 'and',
    conditions: Array.isArray(value.conditions)
      ? value.conditions.filter(isRecord).map((condition) => ({
          fieldId: toText(condition.fieldId),
          operator: toText(condition.operator),
          value: toText(condition.value),
        }))
      : [],
  };
};
