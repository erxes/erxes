import { referenceToken } from '@erxes/core-contract';
import { assistantReferences, assistantThreads, type Db, newId, withOrg } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { identitiesIn, type RecordIdentity } from './records';
import { ownThread } from './threads.service';

const keyOf = (record: { type: string; id: string }) => `${record.type}:${record.id}`;

export const issueReferences = async (client: Db, threadId: string, records: RecordIdentity[]) => {
  if (records.length === 0) return [];

  const unique = new Map(records.map((record) => [keyOf(record), record]));

  const rows = await client
    .insert(assistantReferences)
    .values(
      [...unique.values()].map((record) => ({
        id: newId(),
        threadId,
        recordType: record.type,
        recordId: record.id,
      })),
    )
    .onConflictDoUpdate({
      target: [
        assistantReferences.orgId,
        assistantReferences.threadId,
        assistantReferences.recordType,
        assistantReferences.recordId,
      ],
      set: { recordId: sql`excluded.record_id` },
    })
    .returning();

  const handles = new Map(
    rows.map((row) => [keyOf({ type: row.recordType, id: row.recordId }), row.id]),
  );

  return records.flatMap((record) => {
    const handle = handles.get(keyOf(record));

    return handle ? [{ ...record, handle, ref: referenceToken(handle) }] : [];
  });
};

export const findReference = async (client: Db, handle: string) => {
  const [row] = await client
    .select({ type: assistantReferences.recordType, id: assistantReferences.recordId })
    .from(assistantReferences)
    .innerJoin(assistantThreads, eq(assistantThreads.id, assistantReferences.threadId))
    .where(and(eq(assistantReferences.id, handle), ownThread()))
    .limit(1);

  return row ?? null;
};

/** For a tool result: a reference in the thread for each record it returns. */
export const referencesIn =
  (orgId: string, threadId: string) => async (schema: unknown, result: unknown) => {
    const identities = identitiesIn(schema, result);

    if (identities.length === 0) return [];

    const issued = await withOrg(orgId, (tx) => issueReferences(tx, threadId, identities));

    return issued.map(({ ref, type, label }) => ({ ref, type, label }));
  };
