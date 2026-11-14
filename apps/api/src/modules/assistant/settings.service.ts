import { assistantSettings, type Db } from '@erxes/core-db';
import type { ASSISTANT_APPROVAL_MODES } from '@erxes/core-db/enums';
import { sql } from 'drizzle-orm';

export type ApprovalMode = (typeof ASSISTANT_APPROVAL_MODES)[number];

export interface SettingsChange {
  approvalMode?: ApprovalMode;
  codeMode?: boolean;
}

export const getSettings = async (client: Db) => {
  const [row] = await client.select().from(assistantSettings).limit(1);

  return {
    approvalMode: row?.approvalMode ?? ('writes' satisfies ApprovalMode),
    codeMode: row?.codeMode ?? false,
  };
};

export const updateSettings = async (client: Db, change: SettingsChange) => {
  const [row] = await client
    .insert(assistantSettings)
    .values(change)
    .onConflictDoUpdate({
      target: assistantSettings.orgId,
      set: { ...change, updatedAt: sql`now()` },
    })
    .returning();

  if (!row) throw new Error('The assistant settings were not returned');

  return row;
};
