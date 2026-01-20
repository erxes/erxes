import { z } from 'zod';

export const triggerFormSchema = z.object({
  botId: z.string({ message: 'You should select a bot' }),
  persistentMenuIds: z.array(z.string()).optional(),
  conditions: z
    .array(
      z
        .object({
          _id: z.string(),
          type: z.string(),
          isSelected: z.boolean().optional(),
          persistentMenuIds: z.array(z.string()).optional(),
          conditions: z
            .array(
              z.object({
                _id: z.string(),
                operator: z.string(),
                keywords: z.array(
                  z.object({
                    _id: z.string(),
                    text: z.string(),
                    isEditing: z.boolean().optional(),
                  }),
                ),
              }),
            )
            .optional(),
        })
        .superRefine((data, ctx) => {
          const { type, isSelected, persistentMenuIds, conditions } = data;

          if (isSelected) {
            if (
              type === 'persistentMenu' &&
              (!persistentMenuIds || persistentMenuIds.length === 0)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'You should select some persistent menu',
                path: ['persistentMenuIds'],
              });
            }

            if (type === 'direct' && (!conditions || conditions.length === 0)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  'You should provide at least one keyword on direct message',
                path: ['conditions'],
              });
            }
          }
        }),
    )
    .optional(),
});

export type TMessageTriggerForm = z.infer<typeof triggerFormSchema>;

export type TMessageTriggerFormCondition = NonNullable<
  TMessageTriggerForm['conditions']
>[number];

export type TMessageTriggerFormDirectMessage = NonNullable<
  TMessageTriggerFormCondition['conditions']
>;

export type TMessageTriggerFormPersistentMenu = NonNullable<
  TMessageTriggerFormCondition['persistentMenuIds']
>;
