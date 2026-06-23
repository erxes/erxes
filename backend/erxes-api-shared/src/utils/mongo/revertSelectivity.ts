/**
 * Selectivity for revert capture: decide which collections/schemas get capture
 * hooks at all. Denied schemas get ZERO hooks installed, so there is no
 * per-write overhead for them.
 *
 * Log-family matching is SEGMENT-aware (not naive substring) so business
 * collections like `blogs`/`catalogs` are never wrongly denied.
 *
 * Two mechanisms, both evaluated in installRevertCaptureHooks:
 *   (a) a collection-name denylist (this module), and
 *   (b) a per-schema opt-out flag (`schema.options.revertCapture === false` or
 *       `schema.options.skipRevertCapture === true`), checked at the install site.
 *
 * The logs collections are ALWAYS denied — journaling the journal would recurse.
 */

/**
 * Collections that must never be auto-journaled. Small, clearly-commented, and
 * extensible. Matching is case-insensitive and substring-aware for the log
 * family (so `{subdomain}_logs`, `logs`, `event_logs` all match), exact for the
 * rest.
 *
 * Categories:
 *  - the journal itself + audit/event streams (recursion / journal-the-journal),
 *  - ephemeral session / queue / lock / job churn (never undone),
 *  - high-frequency metric/health rows (never undone).
 */
export const REVERT_CAPTURE_DENYLIST: ReadonlyArray<string> = [
  // The journal itself (and any *_logs / event_logs variant) — avoid recursion.
  'logs',
  'event_logs',
  'eventlogs',
  'audit_logs',
  'auditlogs',
  // Ephemeral session / auth churn — never undone.
  'sessions',
  'user_sessions',
  'login_sessions',
  // Queue / job / lock infra — transient, high churn, never undone.
  'jobs',
  'job_queue',
  'bullmq',
  'locks',
  'agenda_jobs',
  // Metrics / health / heartbeat — high-frequency, never undone.
  'metrics',
  'health_checks',
  'healthchecks',
  'heartbeats',
];

/**
 * True when a collection belongs to the log/audit journal family (the recursion
 * guard). Matched on SEGMENT boundaries, NOT naive substring, so business
 * collections that merely contain "logs" (blogs, catalogs, dialogs, changelogs)
 * are not wrongly denied — that would silently make them un-revertable.
 * Matches: `logs`, `log`, any `*_log` / `*_logs` (e.g. `{subdomain}_logs`), and
 * the `event_log(s)` / `audit_log(s)` tokens when they appear as whole, underscore-
 * delimited segments (so `prevent_logger` / `catalogs` are NOT wrongly denied).
 */
const isLogFamily = (name: string): boolean =>
  name === 'logs' ||
  name === 'log' ||
  /_logs?$/.test(name) ||
  /(^|_)event_logs?($|_)/.test(name) ||
  /(^|_)audit_logs?($|_)/.test(name);

/**
 * Optional env override: a comma-separated list of additional collection names
 * to deny. Parsed once at module load. Not required — defaults stand alone.
 */
const ENV_DENY: ReadonlySet<string> = new Set(
  (process.env.REVERT_CAPTURE_DENYLIST || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

/**
 * True when a collection must be skipped by revert capture. Always skips the log
 * family (segment-bounded) so the journal can never journal itself; otherwise
 * exact (case-insensitive) match against the denylist + env override.
 */
export const isRevertCaptureDenied = (collectionName?: string): boolean => {
  if (!collectionName) return false;
  const name = collectionName.toLowerCase();

  // Log/audit family (segment-bounded) — guards `{subdomain}_logs` and friends
  // without catching business collections like `blogs` / `catalogs`.
  if (isLogFamily(name)) return true;

  if (REVERT_CAPTURE_DENYLIST.some((d) => d.toLowerCase() === name)) return true;
  if (ENV_DENY.has(name)) return true;

  return false;
};

/** Per-schema opt-out: `schema.options.revertCapture === false` etc. */
export const isSchemaRevertOptedOut = (options?: {
  revertCapture?: boolean;
  skipRevertCapture?: boolean;
}): boolean =>
  Boolean(options) &&
  (options?.revertCapture === false || options?.skipRevertCapture === true);
