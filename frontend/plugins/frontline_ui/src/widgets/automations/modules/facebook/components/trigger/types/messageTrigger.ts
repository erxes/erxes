import { z } from 'zod';
import { messageTriggerSchema } from '../schemas/messageTriggerSchema';

export type TMessageTriggerForm = z.infer<typeof messageTriggerSchema>;

export type TMessageTriggerCondition = NonNullable<
  TMessageTriggerForm['conditions']
>[number];

export type TMessageTriggerDirectConditions = NonNullable<
  TMessageTriggerCondition['conditions']
>;

export type TMessageTriggerPersistentMenuIds = NonNullable<
  TMessageTriggerCondition['persistentMenuIds']
>;

export type TMessageTriggerIceBreakerIds = NonNullable<
  TMessageTriggerCondition['iceBreakerIds']
>;

export type TMessageTriggerSourceMode = NonNullable<
  TMessageTriggerCondition['sourceMode']
>;

export type TMessageTriggerSourceIds = NonNullable<
  TMessageTriggerCondition['sourceIds']
>;
