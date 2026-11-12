import type { auditLogs, auditStreams } from '@erxes/core-db';

type AuditRow = typeof auditLogs.$inferSelect;

/** One entry as the stream sends it: everything needed to check the hash chain on the other side. */
export const streamEntry = (row: AuditRow) => ({
  id: row.id,
  seq: row.chainSeq,
  prevHash: row.prevHash,
  hash: row.hash,
  createdAt: row.createdAt.toISOString(),
  source: row.source,
  action: row.action,
  actor: { type: row.actorType, id: row.actorId },
  target: row.targetType
    ? { type: row.targetType, id: row.targetId, label: row.targetLabel }
    : null,
  changes: row.changes,
  metadata: row.metadata,
  ip: row.ip,
  userAgent: row.userAgent,
});

export type StreamEntry = ReturnType<typeof streamEntry>;

/**
 * The request body in the service's own format:
 * - `erxes`: `{ stream, organization, gap, entries }` (signed, chain fields included);
 * - `datadog`: the logs intake's JSON array (`ddsource: erxes`, tags per entry);
 * - `splunk`: HTTP Event Collector events, one JSON object per line.
 * A `gap` (entries pruned by retention before they could be sent) is named
 * in every format, so the receiver knows the chain has a hole and why.
 */
export const formatBatch = (
  format: (typeof auditStreams.$inferSelect)['format'],
  context: { streamId: string; organization: { id: string; subdomain: string } },
  entries: StreamEntry[],
  gap: { fromSeq: number; toSeq: number } | null,
) => {
  if (format === 'erxes') {
    return JSON.stringify({
      stream: context.streamId,
      organization: context.organization,
      gap,
      entries,
    });
  }

  const gapEntry: StreamEntry[] = gap
    ? [
        {
          id: `gap-${gap.fromSeq}-${gap.toSeq}`,
          seq: null,
          prevHash: null,
          hash: null,
          createdAt: new Date().toISOString(),
          source: 'core',
          action: 'audit.stream_gap',
          actor: { type: 'system', id: null },
          target: null,
          changes: null,
          metadata: { ...gap, reason: 'pruned by retention before delivery' },
          ip: null,
          userAgent: null,
        },
      ]
    : [];

  const all = [...gapEntry, ...entries];

  if (format === 'datadog') {
    return JSON.stringify(
      all.map((entry) => ({
        ddsource: 'erxes',
        service: 'erxes-audit',
        hostname: context.organization.subdomain,
        ddtags: `org:${context.organization.subdomain},source:${entry.source ?? 'core'},action:${entry.action}`,
        message: [entry.action, entry.target?.label ?? entry.target?.id].filter(Boolean).join(' '),
        timestamp: Date.parse(entry.createdAt),
        erxes: entry,
      })),
    );
  }

  return all
    .map((entry) =>
      JSON.stringify({
        time: Date.parse(entry.createdAt) / 1000,
        host: context.organization.subdomain,
        source: 'erxes',
        sourcetype: 'erxes:audit',
        event: entry,
      }),
    )
    .join('\n');
};
