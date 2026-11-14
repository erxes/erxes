import { assistantSettings, type Db } from '@erxes/core-db';
import type { ASSISTANT_APPROVAL_MODES } from '@erxes/core-db/enums';
import { sql } from 'drizzle-orm';

export type ApprovalMode = (typeof ASSISTANT_APPROVAL_MODES)[number];

export const getSettings = async (client: Db) => {
  const [row] = await client.select().from(assistantSettings).limit(1);

  return { approvalMode: row?.approvalMode ?? ('writes' satisfies ApprovalMode) };
};

export const updateSettings = async (client: Db, approvalMode: ApprovalMode) => {
  await client
    .insert(assistantSettings)
    .values({ approvalMode })
    .onConflictDoUpdate({
      target: assistantSettings.orgId,
      set: { approvalMode, updatedAt: sql`now()` },
    });

  return { approvalMode };
};
