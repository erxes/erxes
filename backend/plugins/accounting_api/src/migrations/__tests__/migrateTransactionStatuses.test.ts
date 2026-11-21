import sift from 'sift';
import type { Collection, Document } from 'mongodb';
import { migrateTransactionStatuses } from '../migrateTransactionStatuses';

type TRow = { _id: string; status?: string; mentionUserIds?: string[] };

const memoryCollection = (rows: TRow[]) =>
  ({
    countDocuments: async (filter: object) => rows.filter(sift(filter)).length,
    updateMany: async (filter: object, update: { $set: Partial<TRow> }) => {
      const matched = rows.filter(sift(filter));
      matched.forEach((row) => Object.assign(row, update.$set));
      return { modifiedCount: matched.length };
    },
  } as unknown as Collection<Document>);

const legacyRows = (): TRow[] => [
  { _id: 'progress', status: 'progress' },
  { _id: 'assigned', status: 'assigned' },
  { _id: 'confirmed', status: 'confirmed' },
  { _id: 'cancelled', status: 'canelled' },
  { _id: 'approved', status: 'approved', mentionUserIds: ['boss'] },
  { _id: 'returned', status: 'returned', mentionUserIds: ['owner'] },
  { _id: 'rejected-alone', status: 'rejeced', mentionUserIds: [] },
  { _id: 'mentioned-alone', status: 'mentioned' },
  { _id: 'mentioned', status: 'mentioned', mentionUserIds: ['boss'] },
  { _id: 'draft', status: 'draft' },
  { _id: 'plan', status: 'plan' },
  { _id: 'complete', status: 'complete' },
  { _id: 'completed', status: 'completed' },
  { _id: 'odd', status: 'archived' },
];

describe('transaction status migration', () => {
  it('maps old statuses to their equivalents and action statuses to the step before', async () => {
    const rows = legacyRows();

    const result = await migrateTransactionStatuses(memoryCollection(rows));

    expect(
      Object.fromEntries(rows.map((row) => [row._id, row.status])),
    ).toEqual({
      progress: 'estimated',
      assigned: 'estimated',
      confirmed: 'estimated',
      cancelled: 'estimated',
      approved: 'mentioned',
      returned: 'mentioned',
      'rejected-alone': 'draft',
      'mentioned-alone': 'draft',
      mentioned: 'mentioned',
      draft: 'draft',
      plan: 'plan',
      complete: 'complete',
      completed: 'complete',
      odd: 'archived',
    });
    expect(result).toEqual({
      steps: {
        'completed-to-complete': 1,
        'business-to-estimated': 4,
        'actions-to-mentioned': 2,
        'actions-to-draft': 1,
        'unaddressed-mentioned-to-draft': 1,
      },
      unknown: 1,
    });
  });

  it('counts on a dry run exactly what the run changes and is a no-op when run again', async () => {
    const rows = legacyRows();
    const collection = memoryCollection(rows);

    const dry = await migrateTransactionStatuses(collection, { dryRun: true });
    expect(rows[0].status).toBe('progress');

    expect(await migrateTransactionStatuses(collection)).toEqual(dry);
    const again = await migrateTransactionStatuses(collection);
    expect(Object.values(again.steps).every((count) => count === 0)).toBe(true);
  });
});
