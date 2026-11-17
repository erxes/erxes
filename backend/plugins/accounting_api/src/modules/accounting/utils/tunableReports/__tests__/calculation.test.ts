import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IReportDocument, reportInputSchema } from '../../../@types/report';
import { reportDateMatch } from '../period';
import { applyReportPercent, validateReportPercent } from '../percent';
import { calculateLedgerFormula, selectReportAccounts } from '../ledger';
import { generateTunableReport } from '..';
import { generateFilter } from '../../../graphql/resolvers/queries/accounts';

jest.mock('../../../graphql/resolvers/queries/accounts', () => ({
  generateFilter: jest.fn().mockResolvedValue({ _id: { $in: ['a', 'b'] } }),
}));
const user = { _id: 'member' } as IUserDocument;
const definition = (): IReportDocument =>
  ({
    ...reportInputSchema.parse({
      code: 'R',
      name: 'Report',
      sections: [
        {
          _id: 's',
          columns: [{ _id: 'c', name: 'Closing', getDate: 'last' }],
          rows: [
            { _id: 'r', name: 'Balance' },
            { _id: 'copy' },
            { _id: 'ratio' },
            { _id: 'negative', kind: 'plus_formula' },
          ],
          formulas: [
            { _id: 'f', rowId: 'r', kind: 'balance', debitAccountId: 'a' },
            {
              _id: 'copy-f',
              rowId: 'copy',
              kind: 'from_row',
              source: { rowId: 'r' },
              percent: '50',
            },
            {
              _id: 'ratio-f',
              rowId: 'ratio',
              kind: 'ratio',
              source: { rowId: 'r' },
              ratioSource: { rowId: 'copy' },
            },
            {
              _id: 'negative-f',
              rowId: 'negative',
              kind: 'from_row',
              source: { rowId: 'r' },
              plusOrMinus: false,
            },
          ],
        },
      ],
    }),
    _id: 'report',
    version: 1,
  } as IReportDocument);
const settings = {
  fromDate: '2026-01-11',
  toDate: '2026-01-20',
  amountUnit: 'thousands' as const,
  decimals: 0,
};
const setup = () => {
  const aggregate = jest
    .fn()
    .mockResolvedValue([{ _id: 'a', amount: 123.456 }]);
  const accounts = [
    { _id: 'a', code: '101', categoryId: 'child', kind: 'active' },
    { _id: 'b', code: '201', categoryId: 'root', kind: 'passive' },
  ];
  const categories = [{ _id: 'root' }, { _id: 'child', parentId: 'root' }];
  const models = {
    Accounts: { find: jest.fn(() => ({ lean: async () => accounts })) },
    AccountCategories: {
      find: jest.fn(() => ({ lean: async () => categories })),
    },
    Transactions: { aggregate },
    Reports: { getReport: jest.fn() },
  } as unknown as IModels;
  return { models, aggregate, accounts, categories };
};

test('opening excludes start day; closing includes entire last day; previous period has equal inclusive length', () => {
  expect(
    reportDateMatch('2026-01-11', '2026-01-20', {
      getDate: 'first',
      isPre: false,
    }),
  ).toEqual({ $lt: new Date('2026-01-11T00:00:00Z') });
  expect(
    reportDateMatch('2026-01-11', '2026-01-20', {
      getDate: 'last',
      isPre: false,
    }),
  ).toEqual({ $lt: new Date('2026-01-21T00:00:00Z') });
  expect(
    reportDateMatch('2026-01-11', '2026-01-20', {
      getDate: 'between',
      isPre: true,
    }),
  ).toEqual({
    $gte: new Date('2026-01-01T00:00:00Z'),
    $lt: new Date('2026-01-11T00:00:00Z'),
  });
  expect(
    reportDateMatch('2024-03-01', '2024-03-01', {
      getDate: 'first',
      isPre: true,
    }),
  ).toEqual({ $lt: new Date('2024-02-29T00:00:00Z') });
});
test('percent rules support conditional/progressive values without executing text', () => {
  expect(applyReportPercent(200, 'if(value>100:[20])10')).toBe(30);
  expect(applyReportPercent(50, 'if(value>100:20)10')).toBe(5);
  expect(applyReportPercent(-20, '-50')).toBe(10);
  expect(() => validateReportPercent('process.exit()')).toThrow();
});
test('category selectors include descendants and deduplicate explicitly selected accounts', () => {
  const { accounts, categories } = setup();
  expect(selectReportAccounts(accounts, categories, 'a', 'root')).toHaveLength(
    2,
  );
});
test('calculates dependencies once and preserves precision before display scaling; clamps positive-only rows', async () => {
  const { models, aggregate } = setup();
  const result = await generateTunableReport(
    models,
    definition(),
    settings,
    user,
  );
  expect(result.map((cell) => cell.value)).toEqual([123.456, 61.728, 2, 0]);
  expect(aggregate).toHaveBeenCalledTimes(1);
  expect(generateFilter).toHaveBeenCalledWith(
    models,
    { permissionMode: 'read' },
    user,
  );
  expect(models.Accounts.find).toHaveBeenCalledWith(
    { _id: { $in: ['a', 'b'] } },
    expect.any(Object),
  );
});
test('balances reverse passive accounts and filter details after unwind', async () => {
  const { models, aggregate, accounts, categories } = setup();
  aggregate.mockResolvedValue([
    { _id: 'a', amount: 80 },
    { _id: 'b', amount: -30 },
  ]);
  const formula = {
    ...definition().sections[0].formulas[0],
    debitAccountCategoryId: 'root',
  };
  expect(
    await calculateLedgerFormula(
      models,
      formula,
      accounts,
      categories,
      { $lt: new Date() },
      'debit',
    ),
  ).toBe(110);
  expect(aggregate.mock.calls[0][0].slice(1, 3)).toEqual([
    { $unwind: '$details' },
    { $match: { 'details.accountId': { $in: ['a', 'b'] } } },
  ]);
});
test('transaction pipeline uses effective opposite related codes, never groups pointers or duplicates amounts', async () => {
  const { models, aggregate, accounts, categories } = setup();
  const formula = {
    ...definition().sections[0].formulas[0],
    kind: 'transaction' as const,
    creditAccountId: 'b',
  };
  await calculateLedgerFormula(
    models,
    formula,
    accounts,
    categories,
    { $gte: new Date() },
    'debit',
  );
  const pipeline = JSON.stringify(aggregate.mock.calls[0][0]);
  expect(pipeline).toContain('relAccounts.customCt');
  expect(pipeline).toContain('relAccounts.ct');
  expect(pipeline).toContain('201');
  expect(pipeline).not.toContain('ptrId');
  expect(pipeline).not.toContain('$expr');
  expect(pipeline).not.toContain('$setIntersection');
  expect(aggregate.mock.calls[0][0][0].$match).toMatchObject({
    side: 'dt',
    'details.accountId': { $in: ['a'] },
    $or: [
      { 'relAccounts.customCt': { $in: ['201'] } },
      {
        'relAccounts.customCt.0': { $exists: false },
        'relAccounts.ct': { $in: ['201'] },
      },
    ],
  });
});
test('runtime guard rejects stale cycles and division by zero', async () => {
  const { models, aggregate } = setup();
  const report = definition();
  report.sections[0].formulas[0] = {
    ...report.sections[0].formulas[0],
    kind: 'from_row',
    source: { rowId: 'copy' },
  };
  await expect(
    generateTunableReport(models, report, settings, user),
  ).rejects.toThrow('Circular');
  aggregate.mockResolvedValue([]);
  await expect(
    generateTunableReport(models, definition(), settings, user),
  ).rejects.toThrow('divide by zero');
});

test('cross-report cell references reuse computed values and load the source report once', async () => {
  const { models, aggregate } = setup();
  const report = definition();
  const source = definition();
  source._id = 'source';
  source.sections[0].formulaType = 'cell';
  source.sections[0].formulas = [
    { ...source.sections[0].formulas[0], columnId: 'c' },
  ];
  report.sections[0].formulaType = 'cell';
  report.sections[0].formulas = report.sections[0].formulas.map((formula) => ({
    ...formula,
    columnId: 'c',
  }));
  report.sections[0].formulas[0] = {
    ...report.sections[0].formulas[0],
    kind: 'from_row',
    source: { reportId: source._id, sectionId: 's', rowId: 'r', columnId: 'c' },
  };
  const load = jest
    .spyOn(models.Reports, 'getReport')
    .mockResolvedValue(source);
  expect(
    (await generateTunableReport(models, report, settings, user)).map(
      (cell) => cell.value,
    ),
  ).toEqual([123.456, 61.728, 2, 0]);
  expect(load).toHaveBeenCalledTimes(1);
  expect(aggregate).toHaveBeenCalledTimes(1);
});
