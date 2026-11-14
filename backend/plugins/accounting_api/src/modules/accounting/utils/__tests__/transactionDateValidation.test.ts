import type { IModels } from '~/connectionResolvers';
import type {
  ITransaction,
  ITransactionDocument,
} from '../../@types/transaction';
import { commonSave, commonSaveValidation } from '../commonSave';
import { commonRemove, commonRemoveValidation } from '../commonRemove';
import { validateTransactionDate } from '../transactionDateValidation';
import { createOrUpdateTr, removeSyncProductsInventory } from '../utils';

jest.mock('../utils', () => ({
  createOrUpdateTr: jest.fn(),
  removeSyncProductsInventory: jest.fn(),
}));

type TAdjustment = { _id: string; date: Date; status: string };
type TSelector = {
  status: { $in: string[] };
  _id?: { $ne: string };
};

const setup = () => {
  const records: Record<string, TAdjustment[]> = {};
  const model = (name: string) => ({
    findOne: jest.fn((selector: TSelector) => ({
      sort: () => ({
        lean: async () =>
          (records[name] || [])
            .filter(
              (row) =>
                selector.status.$in.includes(row.status) &&
                row._id !== selector._id?.$ne,
            )
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0] || null,
      }),
    })),
  });
  const models = {
    AdjustClosings: model('AdjustClosings'),
    AdjustInventories: model('AdjustInventories'),
    AdjustFixedAssets: model('AdjustFixedAssets'),
    AdjustFundRates: model('AdjustFundRates'),
    AdjustDebtRates: model('AdjustDebtRates'),
  };
  return { models: models as unknown as IModels, records, queries: models };
};

const transaction = (
  journal = 'fxaIncome',
  date = '2026-01-01T12:00:00',
): ITransaction => ({
  _id: 'income',
  journal,
  date: new Date(date),
  side: 'dt',
  details: [{ accountId: 'asset-account', fixedAssetId: 'asset', amount: 100 }],
});
const adjustment = (
  status = 'complete',
  date = '2026-01-31T00:00:00',
): TAdjustment => ({
  _id: 'adjustment',
  date: new Date(date),
  status,
});

beforeEach(() => jest.clearAllMocks());

it.each([
  ['fxaIncome', 'AdjustFixedAssets', 'complete'],
  ['fxaMove', 'AdjustFixedAssets', 'publish'],
  ['fxaOut', 'AdjustFixedAssets', 'complete'],
  ['fxaSale', 'AdjustFixedAssets', 'complete'],
  ['invIncome', 'AdjustInventories', 'publish'],
  ['bank', 'AdjustFundRates', 'complete'],
  ['payable', 'AdjustDebtRates', 'complete'],
  ['main', 'AdjustClosings', 'publish'],
])(
  'blocks create/edit/remove for %s before a posted adjustment',
  async (journal, model, status) => {
    const { models, records } = setup();
    records[model] = [adjustment(status)];
    const doc = transaction(journal);
    const persisted = doc as ITransactionDocument;
    for (const operation of [
      () => commonSaveValidation('tenant', models, 'user', doc),
      () => commonSaveValidation('tenant', models, 'user', doc, persisted),
      () => commonSave('tenant', models, 'user', doc),
      () => commonSave('tenant', models, 'user', doc, persisted),
      () => commonRemoveValidation('tenant', models, persisted),
      () => commonRemove('tenant', models, persisted),
    ]) {
      await expect(operation()).rejects.toThrow('before changing transactions');
    }
    expect(createOrUpdateTr).not.toHaveBeenCalled();
    expect(removeSyncProductsInventory).not.toHaveBeenCalled();
  },
);

it.each([
  ['2026-01-01T00:00:00', '2026-02-01T00:00:00'],
  ['2026-02-01T00:00:00', '2026-01-01T00:00:00'],
  ['2026-01-31T23:59:59', '2026-01-31T23:59:59'],
])(
  'checks both dates and the whole cutoff day (%s -> %s)',
  async (oldDate, date) => {
    const { models, records } = setup();
    records.AdjustFixedAssets = [adjustment()];
    await expect(
      validateTransactionDate(
        models,
        transaction('fxaIncome', date),
        transaction('fxaIncome', oldDate),
      ),
    ).rejects.toThrow('fixed asset adjustment');
  },
);

it('allows transactions after the cutoff and ignores drafts/unposted calculations', async () => {
  const { models, records } = setup();
  records.AdjustFixedAssets = [adjustment()];
  await validateTransactionDate(
    models,
    transaction('fxaIncome', '2026-02-01T00:00:00'),
  );
  records.AdjustFixedAssets = [adjustment('draft'), adjustment('process')];
  await validateTransactionDate(models, transaction());
});

it('excludes its own posting/undo workflow but still blocks later adjustments', async () => {
  const { models, records } = setup();
  const doc = {
    ...transaction('fxaDep', '2026-01-31T00:00:00'),
    contentType: 'accounting:adjustFixedAsset',
    contentId: 'adjustment',
  };
  records.AdjustFixedAssets = [adjustment()];
  await validateTransactionDate(models, doc);
  records.AdjustFixedAssets.push({
    ...adjustment('complete', '2026-02-28T00:00:00'),
    _id: 'later',
  });
  await expect(validateTransactionDate(models, doc)).rejects.toThrow(
    'fixed asset adjustment',
  );
});

it('checks only closing and the journal-specific adjustment', async () => {
  const { models, queries } = setup();
  await validateTransactionDate(models, transaction());
  expect(queries.AdjustClosings.findOne).toHaveBeenCalled();
  expect(queries.AdjustFixedAssets.findOne).toHaveBeenCalled();
  expect(queries.AdjustInventories.findOne).not.toHaveBeenCalled();
  expect(queries.AdjustFundRates.findOne).not.toHaveBeenCalled();
  expect(queries.AdjustDebtRates.findOne).not.toHaveBeenCalled();
});

it('rejects an invalid transaction date', async () => {
  const { models } = setup();
  await expect(
    validateTransactionDate(models, transaction('fxaIncome', 'invalid')),
  ).rejects.toThrow('Invalid transaction date');
});

it('rejects an invalid saved date before moving into an open period', async () => {
  const { models } = setup();
  await expect(
    validateTransactionDate(
      models,
      transaction(),
      transaction('fxaIncome', 'invalid'),
    ),
  ).rejects.toThrow('Invalid transaction date');
});

it.each([
  'main',
  'tax',
  'exchangeDiff',
  'invIncome',
  'fxaIncome',
  'bank',
  'payable',
])(
  'checks closing once and skips journal-specific lookups when %s is closed',
  async (journal) => {
    const { models, records, queries } = setup();
    records.AdjustClosings = [adjustment('publish')];
    records.AdjustFixedAssets = [adjustment()];
    await expect(
      validateTransactionDate(models, transaction(journal)),
    ).rejects.toThrow('closing adjustment');
    expect(queries.AdjustClosings.findOne).toHaveBeenCalledTimes(1);
    for (const model of [
      queries.AdjustFixedAssets,
      queries.AdjustInventories,
      queries.AdjustFundRates,
      queries.AdjustDebtRates,
    ]) {
      expect(model.findOne).not.toHaveBeenCalled();
    }
  },
);

it.each([
  ['main', 'AdjustClosings', 'publish'],
  ['fxaIncome', 'AdjustFixedAssets', 'complete'],
  ['invIncome', 'AdjustInventories', 'publish'],
  ['bank', 'AdjustFundRates', 'complete'],
  ['payable', 'AdjustDebtRates', 'complete'],
])(
  'locks %s through 23:59:59.999 and allows the next midnight',
  async (journal, model, status) => {
    const { models, records } = setup();
    records[model] = [adjustment(status, '2026-01-31T08:15:00')];
    await expect(
      validateTransactionDate(
        models,
        transaction(journal, '2026-01-31T23:59:59.999'),
      ),
    ).rejects.toThrow('before changing transactions');
    await validateTransactionDate(
      models,
      transaction(journal, '2026-02-01T00:00:00.000'),
    );
    expect(records[model][0].date.getHours()).toBe(8);
  },
);

it('checks a later journal adjustment when the transaction is after closing', async () => {
  const { models, records, queries } = setup();
  records.AdjustClosings = [adjustment('publish', '2025-12-31T00:00:00')];
  records.AdjustFixedAssets = [adjustment()];
  await expect(validateTransactionDate(models, transaction())).rejects.toThrow(
    'fixed asset adjustment',
  );
  expect(queries.AdjustClosings.findOne).toHaveBeenCalledTimes(1);
  expect(queries.AdjustFixedAssets.findOne).toHaveBeenCalledTimes(1);
});

it('uses the latest posted cutoff even when an older adjustment was inserted first', async () => {
  const { models, records } = setup();
  records.AdjustFixedAssets = [
    adjustment('complete', '2025-12-31T00:00:00'),
    { ...adjustment(), _id: 'latest' },
    { ...adjustment('draft', '2026-02-28T00:00:00'), _id: 'draft' },
  ];
  await expect(validateTransactionDate(models, transaction())).rejects.toThrow(
    '2026-01-31',
  );
});

it('allows its own closing workflow but respects a later closing', async () => {
  const { models, records } = setup();
  const doc = {
    ...transaction('main', '2026-01-31T23:59:59.999'),
    contentType: 'accounting:adjustClosing',
    contentId: 'adjustment',
  };
  records.AdjustClosings = [adjustment('publish')];
  await validateTransactionDate(models, doc);
  records.AdjustClosings.push({
    ...adjustment('publish', '2026-02-28T00:00:00'),
    _id: 'later',
  });
  await expect(validateTransactionDate(models, doc)).rejects.toThrow(
    'closing adjustment',
  );
});
