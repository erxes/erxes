/**
 * `conformities` linked any two records. The customer ↔ company pairs (nearly all 4M) become
 * `core_customer_companies`, through the id map, so a pair of merged records lands on the record
 * kept. Pairs whose customer or company isn't in core are skipped. Pairs that touch a deal, task
 * or ticket are the plugins' to import; they are counted here by plugin.
 */
import type { Db, Document } from 'mongodb';
import { z } from 'zod';
import { resolve } from './idMap';
import { eachBatch, existing, insert, type Run } from './run';
import { readOr, text } from './values';

const Conformity = z.object({ mainType: text, mainTypeId: text, relType: text, relTypeId: text });

type Conformity = z.infer<typeof Conformity>;

/** Old erxes often stored one pair many times; merged records add more. */
const LINKED = 'pair already linked (stored more than once, or merged records)';

const PairCount = z.object({ mainType: text, relType: text, count: z.number() });

const CONTACT_PAIRS = {
  $or: [
    { mainType: 'customer', relType: 'company' },
    { mainType: 'company', relType: 'customer' },
  ],
};

/** Old record types → the plugin that takes their pairs. */
const PLUGIN_OF: Record<string, string> = {
  deal: 'sales',
  'sales:deal': 'sales',
  purchase: 'sales',
  task: 'operation',
  ticket: 'frontline',
  form_submission: 'frontline',
};

/** The customer and company of a contact pair, through the id map; null for other pairs. */
export const contactPair = (link: Conformity) => {
  const customer = link.mainType === 'customer' ? link.mainTypeId : link.relTypeId;
  const company = link.mainType === 'company' ? link.mainTypeId : link.relTypeId;

  return customer && company
    ? { customerId: resolve('customer', customer), companyId: resolve('company', company) }
    : null;
};

/** Why a pair that isn't customer ↔ company stays out. */
export const pairReason = (mainType: string | null, relType: string | null) => {
  const plugin = [mainType, relType].map((type) => PLUGIN_OF[type ?? '']).find(Boolean);

  return plugin
    ? `plugin:${plugin} (${mainType} ↔ ${relType})`
    : `no place for ${mainType ?? '?'} ↔ ${relType ?? '?'}`;
};

const linkBatch = async (run: Run, name: string, documents: Document[]) => {
  const pairs = documents.flatMap((raw) => {
    const link = readOr(Conformity, raw);
    const pair = link && contactPair(link);

    return pair ? [pair] : [];
  });

  const customers = await existing(
    run,
    'core_customers',
    pairs.map((pair) => pair.customerId),
  );

  const companies = await existing(
    run,
    'core_companies',
    pairs.map((pair) => pair.companyId),
  );

  const unique = new Map<string, [string, string]>();

  for (const { customerId, companyId } of pairs) {
    const key = `${customerId}:${companyId}`;

    if (!customers.has(customerId)) run.report.skip(name, 'customer not in core', key);
    else if (!companies.has(companyId)) run.report.skip(name, 'company not in core', key);
    else if (unique.has(key)) run.report.note(name, LINKED, key);
    else unique.set(key, [customerId, companyId]);
  }

  const copied = await insert(run, {
    collection: name,
    table: 'core_customer_companies',
    columns: ['customer_id', 'company_id'],
    rows: [...unique.values()],
    keys: [...unique.keys()],
  });

  if (unique.size > copied) run.report.note(name, LINKED, '', unique.size - copied);
};

/** Customer ↔ company pairs of `db`'s conformities; the other pairs are counted by plugin. */
export const importConformities = async (run: Run, db: Db = run.mongo) => {
  const name = db === run.mongo ? 'conformities' : `${db.databaseName}.conformities`;
  const collection = db.collection('conformities');

  run.report.of(name, 'core_customer_companies');

  const others = await collection
    .aggregate([
      { $match: { $nor: CONTACT_PAIRS.$or } },
      { $group: { _id: { mainType: '$mainType', relType: '$relType' }, count: { $sum: 1 } } },
      { $project: { _id: 0, mainType: '$_id.mainType', relType: '$_id.relType', count: 1 } },
    ])
    .toArray();

  for (const raw of others) {
    const group = readOr(PairCount, raw);

    if (!group) continue;

    run.report.seen(name, group.count);
    run.report.skip(name, pairReason(group.mainType, group.relType), '', group.count);
  }

  await eachBatch(
    run,
    collection,
    (documents) => linkBatch(run, name, documents),
    CONTACT_PAIRS,
    name,
  );
};
