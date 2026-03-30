import { z } from 'zod';

export const messageTriggerSchema = z.object({
  botId: z.string({ message: 'You should select a bot' }),
  persistentMenuIds: z.array(z.string()).optional(),
  conditions: z
    .array(
      z
        .object({
          _id: z.string(),
          type: z.enum([
            'getStarted',
            'persistentMenu',
            'direct',
            'open_thread',
          ]),
          isSelected: z.boolean().optional(),
          persistentMenuIds: z.array(z.string()).optional(),
          sourceMode: z.enum(['all', 'specific']).optional(),
          sourceIds: z.array(z.string()).optional(),
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
          const {
            type,
            isSelected,
            persistentMenuIds,
            conditions,
            sourceMode,
            sourceIds,
          } = data;

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

            if (
              type === 'open_thread' &&
              sourceMode === 'specific' &&
              (!sourceIds || sourceIds.length === 0)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'You should provide at least one source id',
                path: ['sourceIds'],
              });
            }
          }
        }),
    )
    .optional(),
});
