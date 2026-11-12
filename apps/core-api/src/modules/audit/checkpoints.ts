import { auditCheckpoints, type Db } from '@erxes/core-db';
import { and, asc, eq, gt, sql } from 'drizzle-orm';
import { currentKeyId, signJwt, verifyJwt } from '~/lib/signing';
import { log } from '~/lib/log';

const CHECKPOINT_TYP = 'erxes-audit-checkpoint+jwt';

interface CheckpointClaims {
  org: string;
  seq: number;
  hash: string;
}

/**
 * Walks an organisation's audit chain (from `fromSeq`, or from its first
 * entry) and returns the first position where it breaks: an entry whose hash
 * doesn't match its contents, or a link to the previous entry that doesn't hold.
 */
export const findChainBreak = async (client: Db, orgId: string, fromSeq?: number) => {
  const result = await client.execute<{
    checked: number;
    broken_at: number | null;
    first_seq: number | null;
    head_seq: number | null;
  }>(sql`
    with chain as (
      select a.chain_seq,
             a.hash,
             a.prev_hash,
             core_audit_entry_hash(a.prev_hash, a) as expected,
             lag(a.hash) over (order by a.chain_seq) as previous_hash,
             lag(a.chain_seq) over (order by a.chain_seq) as previous_seq
      from core_audit_logs a
      where a.org_id = ${orgId} and a.chain_seq is not null
        and (${fromSeq ?? null}::bigint is null or a.chain_seq >= ${fromSeq ?? null}::bigint)
    )
    select count(*)::int as checked,
           min(chain_seq)::int as first_seq,
           max(chain_seq)::int as head_seq,
           min(chain_seq) filter (
             where hash is distinct from expected
                or (previous_seq is not null and (prev_hash is distinct from previous_hash or chain_seq <> previous_seq + 1))
           )::int as broken_at
    from chain
  `);
  const row = result.rows[0];

  return {
    checked: row?.checked ?? 0,
    brokenAt: row?.broken_at ?? null,
    firstSeq: row?.first_seq ?? null,
    headSeq: row?.head_seq ?? null,
  };
};

/**
 * Signs the head of every organisation's audit chain that moved since its last
 * checkpoint — only after checking the entries added since then, so a chain
 * that was tampered with is never signed. Safe on several replicas at once.
 */
export const signAuditCheckpoints = async (client: Db, orgId?: string) => {
  const heads = await client.execute<{
    org_id: string;
    head_seq: number;
    head_hash: string;
    last_seq: number | null;
    last_hash: string | null;
  }>(sql`
    select o.id as org_id, h.chain_seq::int as head_seq, h.hash as head_hash, c.chain_seq::int as last_seq, c.hash as last_hash
    from core_organizations o
    join lateral (
      select chain_seq, hash from core_audit_logs
      where org_id = o.id and chain_seq is not null
      order by chain_seq desc limit 1
    ) h on true
    left join lateral (
      select chain_seq, hash from core_audit_checkpoints
      where org_id = o.id
      order by chain_seq desc limit 1
    ) c on true
    where (c.chain_seq is null or h.chain_seq > c.chain_seq)
      and (${orgId ?? null}::text is null or o.id = ${orgId ?? null}::text)
  `);
  let signed = 0;

  for (const head of heads.rows) {
    if (head.last_seq !== null) {
      const [anchor] = await client
        .execute<{ hash: string }>(sql`
        select hash from core_audit_logs where org_id = ${head.org_id} and chain_seq = ${head.last_seq}
      `)
        .then((result) => result.rows);

      // The last signed entry was changed: don't sign over it. (If retention
      // removed it, the walk below starts from the oldest entry kept.)
      if (anchor && anchor.hash !== head.last_hash) {
        log.error(
          `audit chain of ${head.org_id} no longer matches checkpoint #${head.last_seq}; not signing`,
        );
        continue;
      }
    }

    const walk = await findChainBreak(client, head.org_id, head.last_seq ?? undefined);

    if (walk.brokenAt !== null) {
      log.error(`audit chain of ${head.org_id} breaks at #${walk.brokenAt}; not signing`);
      continue;
    }

    const signature = await signJwt(
      { org: head.org_id, seq: head.head_seq, hash: head.head_hash } satisfies CheckpointClaims,
      {
        typ: CHECKPOINT_TYP,
        subject: head.org_id,
      },
    );
    const inserted = await client
      .insert(auditCheckpoints)
      .values({
        orgId: head.org_id,
        chainSeq: head.head_seq,
        hash: head.head_hash,
        keyId: currentKeyId(),
        signature,
      })
      .onConflictDoNothing()
      .returning({ seq: auditCheckpoints.chainSeq });

    signed += inserted.length;
  }

  return signed;
};

/**
 * Checks every checkpoint still within the log: its signature (core's key),
 * and that the entry it names still has the hash it signed. Catches a chain
 * rewritten end to end and entries cut off its end.
 */
export const verifyCheckpoints = async (client: Db, orgId: string, firstSeq: number | null) => {
  const rows = await client.execute<{
    chain_seq: number;
    hash: string;
    signature: string;
    created_at: Date;
    entry_hash: string | null;
  }>(sql`
    select c.chain_seq::int, c.hash, c.signature, c.created_at, a.hash as entry_hash
    from core_audit_checkpoints c
    left join core_audit_logs a on a.org_id = c.org_id and a.chain_seq = c.chain_seq
    where c.org_id = ${orgId}
    order by c.chain_seq
  `);
  let checked = 0;
  let mismatchAt: number | null = null;
  const latest = rows.rows[rows.rows.length - 1];

  for (const row of rows.rows) {
    // Removed by retention.
    if (firstSeq === null || row.chain_seq < firstSeq) continue;

    checked += 1;

    const valid = await verifyJwt<Partial<CheckpointClaims>>(row.signature, { typ: CHECKPOINT_TYP })
      .then(
        ({ payload }) =>
          payload.org === orgId && payload.seq === row.chain_seq && payload.hash === row.hash,
      )
      .catch(() => false);

    if (!valid || row.entry_hash !== row.hash) {
      mismatchAt = row.chain_seq;
      break;
    }
  }

  // Everything was removed, yet checkpoints say there were entries.
  if (firstSeq === null && latest) {
    mismatchAt = latest.chain_seq;
  }

  return {
    checked,
    latestSeq: latest?.chain_seq ?? null,
    latestAt: latest ? new Date(latest.created_at).toISOString() : null,
    mismatchAt,
  };
};

export const listCheckpoints = async (
  client: Db,
  orgId: string,
  query: { after?: number; limit: number },
) => {
  const rows = await client
    .select()
    .from(auditCheckpoints)
    .where(
      and(
        eq(auditCheckpoints.orgId, orgId),
        query.after !== undefined ? gt(auditCheckpoints.chainSeq, query.after) : undefined,
      ),
    )
    .orderBy(asc(auditCheckpoints.chainSeq))
    .limit(query.limit);

  return {
    data: rows.map((row) => ({
      chainSeq: row.chainSeq,
      hash: row.hash,
      keyId: row.keyId,
      signature: row.signature,
      createdAt: row.createdAt.toISOString(),
    })),
  };
};
