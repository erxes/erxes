import type { AssistantAppearance } from '@erxes/core-contract';
import { assistantAppearances, caller, type Db } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';

const DEFAULT_APPEARANCE: AssistantAppearance = {
  body: 'circle',
  color: 'ink',
  expression: 'neutral',
};

export const getAppearance = async (client: Db) => {
  const [row] = await client
    .select()
    .from(assistantAppearances)
    .where(eq(assistantAppearances.userId, caller('user').userId))
    .limit(1);

  return row ?? DEFAULT_APPEARANCE;
};

export const updateAppearance = async (client: Db, appearance: AssistantAppearance) => {
  const [row] = await client
    .insert(assistantAppearances)
    .values({ userId: caller('user').userId, ...appearance })
    .onConflictDoUpdate({
      target: [assistantAppearances.orgId, assistantAppearances.userId],
      set: { ...appearance, updatedAt: sql`now()` },
    })
    .returning();

  if (!row) throw new Error('The assistant appearance was not returned');

  return row;
};
