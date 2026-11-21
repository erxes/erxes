import type { ActivityTarget } from '@erxes/core-contract';
import { activities, actorOf, caller, type Db, newId } from '@erxes/core-db';

export interface CoreActivity {
  targetType: ActivityTarget;
  targetId: string;
  type: string;
  data?: Record<string, unknown>;
}

/**
 * Adds core's own entries to the timeline. Call it in the same transaction as
 * the change it describes. Imports nothing of core's own, so any module (email
 * sending too) can record without an import cycle.
 */
export const recordActivity = async (client: Db, entries: CoreActivity | CoreActivity[]) => {
  const list = Array.isArray(entries) ? entries : [entries];

  if (!list.length) return;

  const actor = actorOf(caller());

  await client
    .insert(activities)
    .values(list.map((entry) => ({ id: newId(), source: 'core', ...entry, ...actor })));
};
