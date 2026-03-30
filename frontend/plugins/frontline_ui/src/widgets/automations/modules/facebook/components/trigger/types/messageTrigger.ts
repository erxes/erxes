import { z } from 'zod';
import { messageTriggerSchema } from '../schemas/messageTriggerSchema';

export type TMessageTriggerForm = z.infer<typeof messageTriggerSchema>;

export type TMessageTriggerCondition = NonNullable<
  TMessageTriggerForm['conditions']
>[number];

export type TMessageTriggerDirectConditions = NonNullable<
  Extract<TMessageTriggerCondition, { type: 'direct' }>['conditions']
>;

export type TMessageTriggerPersistentMenuIds = NonNullable<
  Extract<TMessageTriggerCondition, { type: 'persistentMenu' }>['persistentMenuIds']
>;

export type TMessageTriggerSourceMode = NonNullable<
  Extract<TMessageTriggerCondition, { type: 'open_thread' }>['sourceMode']
>;

export type TMessageTriggerSourceIds = NonNullable<
  Extract<TMessageTriggerCondition, { type: 'open_thread' }>['sourceIds']
>;
