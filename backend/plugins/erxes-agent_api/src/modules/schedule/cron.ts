// Structural cron check — 5 standard fields (or 6 with seconds, which BullMQ
// also accepts) of cron-safe characters. BullMQ's parser is the authority at
// upsert time; this only keeps obvious garbage out of Mongo so one bad save
// can't silently never fire.
const CRON_FIELD = /^[\d*/,\-A-Za-z?#]+$/;

/** Validates a cron expression structurally; returns it whitespace-normalized. */
export function validateCron(cron?: unknown): string {
  if (typeof cron !== 'string' || !cron.trim()) {
    throw new Error('Cron expression is required');
  }
  const fields = cron.trim().split(/\s+/);
  if (fields.length < 5 || fields.length > 6) {
    throw new Error(
      `Cron expression must have 5 or 6 fields (minute hour day month weekday, optionally with leading seconds), got ${fields.length}`,
    );
  }
  for (const field of fields) {
    if (!CRON_FIELD.test(field)) {
      throw new Error(`Invalid cron field "${field}"`);
    }
  }
  return fields.join(' ');
}

/** Validates an IANA timezone name; blank input defaults to UTC. */
export function validateTimezone(timezone?: unknown): string {
  if (timezone == null || timezone === '') return 'UTC';
  if (typeof timezone !== 'string') throw new Error('Invalid timezone');
  try {
    // Constructing the formatter throws RangeError on unknown zones; the
    // resolved option is the canonical spelling of the zone we validated.
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
    }).resolvedOptions().timeZone;
  } catch {
    throw new Error(`Unknown timezone "${timezone}"`);
  }
}
