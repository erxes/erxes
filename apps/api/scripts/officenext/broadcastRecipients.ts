/**
 * Who each sent campaign reached → `core_broadcast_recipients`, which core's broadcast stats count.
 * Later old erxes kept a row per recipient (`broadcast_recipients`); before that, mail events per
 * customer (`delivery_reports`: send, delivery, open, click, bounce, complaint), read here as one
 * recipient each. Reports carry no times, so a recipient was sent, opened and clicked at the
 * campaign's last run. The address is the customer's email in core, so recipients whose customer
 * isn't in core, or has no email now, stay out.
 */
import type { Db, Document } from 'mongodb';
import { z } from 'zod';
import { sha256 } from '~/lib/crypto';
import { resolve } from './idMap';
import { eachBatch, eachGroup, insert, MINE, type Run } from './run';
import { readOr, record, text, when } from './values';

const Recipient = record({
  engageMessageId: text,
  customerId: text,
  status: text,
  reason: text,
  finishedAt: when,
});

const Report = z.object({
  broadcastId: z.string(),
  customerId: z.string(),
  events: z.array(z.string()),
  grouped: z.number(),
});

type Report = z.infer<typeof Report>;

interface Found {
  emails: Map<string, string>;
  sentAt: Map<string, Date>;
}

/** The recipient a customer's mail events add up to. */
export const fromEvents = (events: string[]) => {
  const reached = events.some((event) => ['delivery', 'open', 'click'].includes(event));

  if (events.includes('bounce') && !reached) return { status: 'failed', reason: 'bounced' };

  return {
    status: 'sent',
    reason: events.includes('complaint') ? 'complained' : null,
    opened: events.includes('open') || events.includes('click'),
    clicked: events.includes('click'),
  };
};

const lookups = async (run: Run, broadcastIds: string[], customerIds: string[]) => {
  const customers = await run.pg.query<{ id: string; email: string }>(
    `SELECT id, primary_email AS email FROM core_customers WHERE ${MINE} AND id = ANY($1::text[]) AND primary_email IS NOT NULL`,
    [customerIds],
  );

  const broadcasts = await run.pg.query<{ id: string; at: Date }>(
    `SELECT id, finished_at AS at FROM core_broadcasts WHERE ${MINE} AND id = ANY($1::text[]) AND status = 'sent'`,
    [broadcastIds],
  );

  return {
    emails: new Map(customers.rows.map((row) => [row.id, row.email])),
    sentAt: new Map(broadcasts.rows.map((row) => [row.id, row.at])),
  };
};

const COLUMNS = [
  'id',
  'broadcast_id',
  'customer_id',
  'address',
  'status',
  'reason',
  'attempts',
  'sent_at',
  'opened_at',
  'clicked_at',
  'created_at',
  'updated_at',
];

const customerOf = (customerId: string | null) => resolve('customer', customerId ?? '');

const ALREADY = 'already a recipient (in both old copies, or two customers share the email)';

const write = async (run: Run, name: string, rows: unknown[][], keys: string[]) => {
  const copied = await insert(run, {
    collection: name,
    table: 'core_broadcast_recipients',
    columns: COLUMNS,
    rows,
    keys,
  });

  if (rows.length > copied) run.report.note(name, ALREADY, '', rows.length - copied);
};

/** Why a recipient can't be placed, or null. */
const missing = (found: Found, broadcastId: string, customerId: string) => {
  if (!found.sentAt.has(broadcastId)) return 'campaign deleted in old erxes, or not an email one';

  return found.emails.has(customerId) ? null : 'customer not in core, or has no email now';
};

const reportBatch = async (run: Run, name: string, documents: Document[]) => {
  const reports = documents.flatMap((raw) => readOr(Report, raw) ?? []);

  const found = await lookups(
    run,
    reports.map((report) => report.broadcastId),
    reports.map((report) => customerOf(report.customerId)),
  );

  const rows = reports.flatMap((report) => {
    const customerId = customerOf(report.customerId);
    const key = `${report.broadcastId}:${report.customerId}`;
    const reason = missing(found, report.broadcastId, customerId);

    if (reason) {
      run.report.skip(name, reason, key, report.grouped);

      return [];
    }

    const at = found.sentAt.get(report.broadcastId) ?? null;
    const recipient = fromEvents(report.events);

    return [
      [
        `r${sha256(key).slice(0, 20)}`,
        report.broadcastId,
        customerId,
        found.emails.get(customerId),
        recipient.status,
        recipient.reason,
        1,
        recipient.status === 'sent' ? at : null,
        'opened' in recipient && recipient.opened ? at : null,
        'clicked' in recipient && recipient.clicked ? at : null,
        at,
        at,
      ],
    ];
  });

  await write(
    run,
    name,
    rows,
    rows.map((row) => String(row[0])),
  );
};

const recipientBatch = async (run: Run, documents: Document[]) => {
  const name = 'broadcast_recipients';
  const recipients = documents.flatMap((raw) => readOr(Recipient, raw) ?? []);

  const found = await lookups(
    run,
    recipients.flatMap((row) => row.engageMessageId ?? []),
    recipients.map((row) => customerOf(row.customerId)),
  );

  const rows = recipients.flatMap((old) => {
    const customerId = customerOf(old.customerId);
    const reason = missing(found, old.engageMessageId ?? '', customerId);

    if (old.reason === 'no email address')
      run.report.skip(name, 'skipped in old erxes: no email address', old.id);
    else if (reason) run.report.skip(name, reason, old.id);

    if (old.reason === 'no email address' || reason) return [];

    const at = old.finishedAt ?? found.sentAt.get(old.engageMessageId ?? '') ?? null;
    const sent = old.status === 'sent';

    return [
      [
        old.id,
        old.engageMessageId,
        customerId,
        found.emails.get(customerId),
        sent ? 'sent' : 'skipped',
        sent ? null : old.reason,
        sent ? 1 : 0,
        sent ? at : null,
        null,
        null,
        at,
        at,
      ],
    ];
  });

  await write(
    run,
    name,
    rows,
    rows.map((row) => String(row[0])),
  );
};

/** One group per campaign and customer, with every event they had. */
const PER_RECIPIENT = [
  {
    $group: {
      _id: { b: '$engageMessageId', c: '$customerId' },
      events: { $addToSet: '$status' },
      grouped: { $sum: 1 },
    },
  },
  { $project: { _id: 0, broadcastId: '$_id.b', customerId: '$_id.c', events: 1, grouped: 1 } },
];

const fromReports = (run: Run, db: Db, collection: string) => {
  const name = db === run.mongo ? collection : `${db.databaseName}.${collection}`;

  run.report.of(name, 'core_broadcast_recipients');

  return eachGroup(
    run,
    db.collection(collection),
    PER_RECIPIENT,
    (documents) => reportBatch(run, name, documents),
    name,
  );
};

/** Recipients of every sent campaign. */
export const importBroadcastRecipients = async (run: Run) => {
  run.report.of('broadcast_recipients', 'core_broadcast_recipients');
  await eachBatch(run, run.mongo.collection('broadcast_recipients'), (documents) =>
    recipientBatch(run, documents),
  );
  await fromReports(run, run.mongo, 'broadcast_delivery_reports');
  await fromReports(run, run.other('erxes_office_engages'), 'delivery_reports');
};
