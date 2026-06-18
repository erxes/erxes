import { z } from 'zod';
import { CONVERSATION_EVENT_GROUP_OPTIONS } from '../constants/conversationEventTrigger';

const conversationEventConditionSchema = z.object({
  _id: z.string().min(1),
  type: z.enum(['assignee', 'status', 'tag']),
  actions: z.array(z.string()).min(1),
  targetIds: z.array(z.string()).optional(),
});

export const conversationEventTriggerFormSchema = z
  .object({
    conditions: z.array(conversationEventConditionSchema).min(1),
  })
  .superRefine(({ conditions }, context) => {
    conditions.forEach((condition, index) => {
      const group = CONVERSATION_EVENT_GROUP_OPTIONS.find(
        ({ type }) => type === condition.type,
      );
      const availableActions = new Set(
        (group?.actions || []).map(({ value }) => value),
      );
      const invalidAction = condition.actions.find(
        (action) => !availableActions.has(action),
      );

      if (invalidAction) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['conditions', index, 'actions'],
          message: 'Invalid conversation event action',
        });
      }

      if (
        condition.type !== 'status' &&
        (!condition.targetIds || condition.targetIds.length === 0)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['conditions', index, 'targetIds'],
          message: 'Select at least one target',
        });
      }
    });
  });

export type TConversationEventTriggerForm = z.infer<
  typeof conversationEventTriggerFormSchema
>;

export type TConversationEventCondition =
  TConversationEventTriggerForm['conditions'][number];
