import { actorOf, caller } from '@erxes/core-db';

export const firing = (type: string, occurredAt: string, payload: Record<string, unknown>) => ({
  type,
  ...actorOf(caller()),
  occurredAt,
  payload,
});

export type FiringEvent = ReturnType<typeof firing>;
