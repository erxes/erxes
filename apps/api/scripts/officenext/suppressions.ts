/**
 * `email_addresses` → `core_suppressions`: old erxes kept one row per address it had mailed, with
 * send counts, and marked the ones it stopped mailing (`suppressedAt`). Those come in as
 * suppressions, so core's broadcasts don't mail them again. Old erxes only suppressed addresses
 * its screening flagged (bad syntax, no mail server, random-looking), which core calls `manual`,
 * with the screening reason as the detail. The rest were plain send counts and stay out.
 */
import { insert, readAll, type Run, unit } from './run';
import { email, readOr, record, text, when } from './values';

const Address = record({
  email: text,
  suppressedAt: when,
  suppressionReason: text,
  screenReason: text,
  releasedAt: when,
  createdAt: when,
});

type Address = NonNullable<ReturnType<typeof Address.parse>>;

/** Old suppression reasons → core's; anything else was old erxes's own screening. */
const REASONS: Record<string, string> = {
  bounced: 'bounced',
  bounce: 'bounced',
  complaint: 'complained',
  complained: 'complained',
  unsubscribed: 'unsubscribed',
};

/** The suppression row, or why the address stays out. */
export const suppressionOf = (old: Address) => {
  const address = email(old.email);

  if (!address) return { skip: 'not an email address' };

  if (!old.suppressedAt) return { skip: 'never suppressed (send counts only)' };

  if (old.releasedAt) return { skip: 'released again in old erxes' };

  const reason = REASONS[old.suppressionReason ?? ''] ?? 'manual';

  const detail =
    reason === 'manual'
      ? ['old erxes screening', old.screenReason].filter(Boolean).join(': ')
      : null;

  return { row: [old.id, 'email', address, reason, detail, old.suppressedAt] };
};

/** Suppressed addresses. */
export const importSuppressions = async (run: Run) => {
  const name = 'email_addresses';
  const addresses = (await readAll(run, name)).flatMap((raw) => readOr(Address, raw) ?? []);

  run.report.of(name, 'core_suppressions');
  run.report.seen(name, addresses.length);

  const rows = addresses.flatMap((old) => {
    const placed = suppressionOf(old);

    if (placed.skip !== undefined) run.report.skip(name, placed.skip, old.id);

    return placed.row ? [placed.row] : [];
  });

  await unit(run, () =>
    insert(run, {
      collection: name,
      table: 'core_suppressions',
      columns: ['id', 'channel', 'address', 'reason', 'detail', 'created_at'],
      rows,
      keys: rows.map((row) => String(row[0])),
    }),
  );
};
