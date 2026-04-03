import { EXECUTE_WAIT_TYPES } from 'erxes-api-shared/core-modules';
import { Schema } from 'mongoose';
import { z } from 'zod';

const waitConditionTypes = [
  EXECUTE_WAIT_TYPES.IS_IN_SEGMENT,
  EXECUTE_WAIT_TYPES.CHECK_OBJECT,
  EXECUTE_WAIT_TYPES.WEBHOOK,
] as const;
export type WaitConditionType = (typeof waitConditionTypes)[number];

const automationWaitingActionCommon = z.object({
  automationId: z.string(),
  executionId: z.string(),
  currentActionId: z.string(),
  responseActionId: z.string(),
  lastCheckedAt: z.date(),
});

const automationWaitingActionDelay = z.object({
  conditionType: z.literal(EXECUTE_WAIT_TYPES.DELAY),
  conditionConfig: z.object({
    subdomain: z.string(),
    waitFor: z.number(),
    timeUnit: z.enum(['minute', 'hour', 'day', 'month', 'year']),
    startWaitingDate: z.date().optional(),
  }),
});

const automationWaitingActionCheckObject = z.object({
  conditionType: z.literal(EXECUTE_WAIT_TYPES.CHECK_OBJECT),
  conditionConfig: z.object({
    contentType: z.string().optional(),
    shouldCheckOptionalConnect: z.boolean().optional(),
    targetId: z.string(),
    expectedState: z.record(z.any()),
    propertyName: z.string(),
    expectedStateConjunction: z.enum(['every', 'some']),
    timeout: z.date(),
  }),
});

const automationExecutionIsInSegment = z.object({
  conditionType: z.literal(EXECUTE_WAIT_TYPES.IS_IN_SEGMENT),
  conditionConfig: z.object({
    targetId: z.string(),
    segmentId: z.string(),
  }),
});

const automationExecutionWebhook = z.object({
  conditionType: z.literal(EXECUTE_WAIT_TYPES.WEBHOOK),
  conditionConfig: z.object({
    endpoint: z.string(),
    secret: z.string(),
    schema: z.string(),
  }),
});

const conditionTypesSchema = z.discriminatedUnion('conditionType', [
  automationWaitingActionDelay,
  automationWaitingActionCheckObject,
  automationExecutionIsInSegment,
  automationExecutionWebhook,
]);

const automationWaitingActionSchema = z.intersection(
  conditionTypesSchema,
  automationWaitingActionCommon,
);

export type IAutomationWaitingAction = z.infer<
  typeof automationWaitingActionSchema
>;
export type IAutomationWaitingActionDocument = {
  _id: string;
} & IAutomationWaitingAction &
  Document;

export const waitingActionsToExecuteSchema = new Schema(
  {
    automationId: { type: String, required: true, index: true },
    executionId: { type: String, required: true, index: true },
    currentActionId: {
      type: String,
      required: true,
    },
    responseActionId: {
      type: String,
    },
    conditionType: {
      type: String,
      enum: waitConditionTypes,
      required: true,
      index: true,
    },
    conditionConfig: {
      type: Schema.Types.Mixed,
      required: true,
    },
    lastCheckedAt: Date,
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);
