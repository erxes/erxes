import { z } from 'zod';

const messengerEventConditionSchema = z.object({
  type: z.enum([
    'directMessage',
    'getStarted',
    'quickReply',
    'customerRegistration',
    'ticketFormSubmission',
    'requestCreateTicket',
  ]),
  isSelected: z.boolean(),
});

export const messengerMessageTriggerFormSchema = z
  .object({
    conditions: z.array(messengerEventConditionSchema),
  })
  .superRefine(({ conditions }, context) => {
    const hasSelected = conditions.some((c) => c.isSelected);
    if (!hasSelected) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['conditions'],
        message: 'Select at least one event type',
      });
    }
  });

export type TMessengerMessageTriggerForm = z.infer<
  typeof messengerMessageTriggerFormSchema
>;

export type TMessengerEventCondition =
  TMessengerMessageTriggerForm['conditions'][number];
